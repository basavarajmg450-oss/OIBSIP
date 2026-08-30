const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Pizza = require('../models/Pizza');
const Inventory = require('../models/Inventory');
const emailService = require('../services/emailService');

/**
 * POST /api/orders/confirm
 * Creates/confirms a CrustCraft Order ONLY AFTER payment status is verified as PAID.
 * Idempotent: If an order already exists for this payment, returns existing order.
 */
const confirmOrder = async (req, res, next) => {
  try {
    const { paymentId, razorpay_payment_id, paymentSessionId } = req.body;
    const lookupId = razorpay_payment_id || paymentId || paymentSessionId;

    if (!lookupId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required for order confirmation'
      });
    }

    // Find verified payment session
    let payment = null;
    if (lookupId.match(/^[0-9a-fA-F]{24}$/)) {
      payment = await Payment.findById(lookupId);
    }
    if (!payment) {
      payment = await Payment.findOne({ razorpayPaymentId: lookupId });
    }
    if (!payment) {
      payment = await Payment.findOne({ razorpayOrderId: lookupId });
    }

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.user.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized for this payment' });
    }

    if (payment.status !== 'PAID') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be confirmed. Payment status is ${payment.status}`
      });
    }

    // Idempotency check: Return existing order if already created for this payment
    const existingOrder = await Order.findOne({
      $or: [
        { payment: payment._id },
        { 'paymentDetails.razorpayPaymentId': payment.razorpayPaymentId }
      ]
    });

    if (existingOrder) {
      return res.status(200).json({
        success: true,
        message: 'Order already confirmed',
        data: existingOrder
      });
    }

    // Create confirmed order
    const order = await Order.create({
      user: payment.user,
      payment: payment._id,
      items: payment.items,
      subtotal: payment.subtotal,
      tax: payment.tax,
      total: payment.total,
      deliveryAddress: payment.deliveryAddress,
      paymentStatus: 'PAID',
      orderStatus: 'Order Received',
      paymentDetails: {
        razorpayOrderId: payment.razorpayOrderId,
        razorpayPaymentId: payment.razorpayPaymentId,
        razorpaySignature: payment.razorpaySignature
      },
      statusHistory: [{ status: 'Order Received', timestamp: new Date() }]
    });

    // Deduct stock for inventory items if applicable
    for (const item of order.items) {
      if (item.isCustom && item.customization) {
        const ingredients = [
          ...(item.customization.cheeses || []),
          ...(item.customization.toppings || [])
        ];
        for (const ingName of ingredients) {
          await Inventory.findOneAndUpdate(
            { name: new RegExp(`^${ingName}$`, 'i') },
            { $inc: { quantity: -item.quantity } }
          );
        }
      }
    }

    // Emit Socket.IO event if available
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${order.user}`).emit('orderUpdated', order);
      io.emit('newOrder', order);
    }

    // Send order confirmation email (handled gracefully if SMTP fails)
    if (emailService && emailService.sendOrderConfirmationEmail) {
      emailService.sendOrderConfirmationEmail(req.user, order).catch(err => {
        console.error('Order confirmation email background error:', err.message);
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order confirmed successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders
 * Fetches order history for the user (only PAID / confirmed orders).
 */
const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
      paymentStatus: 'PAID'
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'User orders fetched successfully',
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id
 * Fetches single order details.
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.user.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }
    res.status(200).json({ success: true, message: 'Order fetched successfully', data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * Legacy createOrder (for backward compatibility if needed, delegates to confirmOrder if paymentId passed)
 */
const createOrder = async (req, res, next) => {
  if (req.body.paymentId || req.body.razorpay_payment_id) {
    return confirmOrder(req, res, next);
  }
  return res.status(400).json({
    success: false,
    message: 'Direct order creation without verified payment is disabled. Please create a payment session first.'
  });
};

module.exports = {
  createOrder,
  confirmOrder,
  getUserOrders,
  getOrderById
};
