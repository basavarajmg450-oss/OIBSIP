const User = require('../models/User');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'ADMIN' }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or not an admin' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    
    const userData = user.toObject();
    delete userData.passwordHash;

    res.status(200).json({ success: true, message: 'Admin login successful', data: { token, user: userData } });
  } catch (error) {
    next(error);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' }); 
    const completedOrders = await Order.countDocuments({ orderStatus: 'Delivered' });
    
    const paidOrders = await Order.find({ paymentStatus: 'PAID' });
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name email');
    
    const inventoryItems = await Inventory.find();
    const lowStockItemsCount = inventoryItems.filter(item => item.quantity <= item.threshold).length;

    res.status(200).json({
      success: true,
      message: 'Dashboard data fetched',
      data: { totalOrders, pendingOrders, completedOrders, totalRevenue, recentOrders, lowStockItemsCount }
    });
  } catch (error) {
    next(error);
  }
};

const getAdminOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = status ? { orderStatus: status } : {};
    const orders = await Order.find(query).populate('user', 'name email phone').sort({ createdAt: -1 });
    res.status(200).json({ success: true, message: 'Orders fetched successfully', data: orders });
  } catch (error) {
    next(error);
  }
};

const getAdminOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone addresses');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, message: 'Order fetched successfully', data: order });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = status;
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({ status, timestamp: new Date() });
    await order.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${order.user}`).emit('orderStatusUpdated', order);
      io.to(`order:${order._id}`).emit('orderStatusUpdated', order);
    }

    res.status(200).json({ success: true, message: 'Order status updated successfully', data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = { adminLogin, getDashboard, getAdminOrders, getAdminOrderById, updateOrderStatus };
