const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Pizza = require('../models/Pizza');
const Inventory = require('../models/Inventory');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret'
});

/**
 * POST /api/payments/create-session
 * Creates a Razorpay order + PENDING Payment record in DB.
 * Does NOT create a CrustCraft Order yet.
 */
const createPaymentSession = async (req, res, next) => {
  try {
    const { items, deliveryAddress } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required' });
    }

    let subtotal = 0;
    const validatedItems = [];

    for (let item of items) {
      if (item.pizza || (!item.isCustom && item.id)) {
        const pizzaId = item.pizza || item.id;
        const pizza = await Pizza.findById(pizzaId);
        if (!pizza) {
          return res.status(404).json({ success: false, message: `Pizza with id ${pizzaId} not found` });
        }
        const itemPrice = pizza.basePrice;
        subtotal += itemPrice * item.quantity;
        validatedItems.push({
          pizza: pizza._id,
          name: pizza.name,
          quantity: item.quantity,
          price: itemPrice,
          isCustom: false
        });
      } else if (item.isCustom) {
        let customPrice = 0;
        if (item.customIngredients && Array.isArray(item.customIngredients)) {
          for (let ing of item.customIngredients) {
            const inventoryItem = await Inventory.findById(ing.inventoryId);
            if (!inventoryItem) {
              return res.status(404).json({ success: false, message: `Ingredient ${ing.inventoryId} not found` });
            }
            if (inventoryItem.quantity < item.quantity) {
              return res.status(400).json({ success: false, message: `Insufficient inventory for ${inventoryItem.name}` });
            }
            customPrice += inventoryItem.price;
          }
        } else {
          customPrice = item.price || 15;
        }
        subtotal += customPrice * item.quantity;
        validatedItems.push({
          name: item.name || 'Custom Pizza',
          quantity: item.quantity,
          price: customPrice,
          isCustom: true,
          customization: item.customization
        });
      }
    }

    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    const amountInPaise = Math.round(total * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    };

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create(options);
    } catch (rzpErr) {
      console.warn('⚠️ Razorpay API fallback (placeholder keys mode):', rzpErr.message || rzpErr.description || rzpErr);
      razorpayOrder = {
        id: `order_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        amount: amountInPaise,
        currency: 'INR'
      };
    }

    const payment = await Payment.create({
      user: req.user.id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      status: 'PENDING',
      items: validatedItems,
      deliveryAddress,
      subtotal,
      tax,
      total
    });

    res.status(200).json({
      success: true,
      message: 'Payment session created',
      data: {
        razorpay_order_id: razorpayOrder.id,
        razorpayOrderId: razorpayOrder.id,
        razorpay_key_id: process.env.RAZORPAY_KEY_ID,
        keyId: process.env.RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        paymentSessionId: payment._id
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payments/verify
 * Validates Razorpay signature server-side.
 * Updates Payment status to PAID on success, FAILED on signature mismatch.
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification parameters'
      });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment session not found' });
    }

    if (expectedSignature === razorpay_signature) {
      payment.status = 'PAID';
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      await payment.save();

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          paymentId: payment._id,
          razorpay_payment_id: payment.razorpayPaymentId,
          razorpay_order_id: payment.razorpayOrderId,
          status: payment.status
        }
      });
    } else {
      payment.status = 'FAILED';
      await payment.save();

      res.status(400).json({
        success: false,
        message: 'Payment verification failed: invalid signature'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payments/webhook
 * Razorpay webhook handler for async event notifications.
 */
const handleWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (webhookSecret && signature) {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      shasum.update(rawBody);
      const digest = shasum.digest('hex');

      if (digest !== signature) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    const event = req.body;
    const payload = event.payload;

    if (event.event === 'payment.authorized' || event.event === 'payment.captured') {
      const paymentEntity = payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      const payment = await Payment.findOne({ razorpayOrderId });
      if (payment && payment.status !== 'PAID') {
        payment.status = 'PAID';
        payment.razorpayPaymentId = razorpayPaymentId;
        payment.webhookProcessedAt = new Date();
        await payment.save();
        console.log(`[WEBHOOK] Payment marked PAID for order_id: ${razorpayOrderId}`);
      }
    } else if (event.event === 'payment.failed') {
      const paymentEntity = payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;

      const payment = await Payment.findOne({ razorpayOrderId });
      if (payment && payment.status === 'PENDING') {
        payment.status = 'FAILED';
        payment.webhookProcessedAt = new Date();
        await payment.save();
        console.log(`[WEBHOOK] Payment marked FAILED for order_id: ${razorpayOrderId}`);
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(500).json({ success: false, message: 'Webhook processing error' });
  }
};

module.exports = {
  createPaymentSession,
  verifyPayment,
  handleWebhook,
  // Backwards compatibility alias
  createPaymentOrder: createPaymentSession
};
