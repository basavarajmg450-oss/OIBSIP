const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  pizza: { type: mongoose.Schema.Types.ObjectId, ref: 'Pizza' },
  name: { type: String },
  quantity: { type: Number },
  price: { type: Number },
  isCustom: { type: Boolean },
  customization: {
    base: { type: String },
    sauce: { type: String },
    cheeses: [{ type: String }],
    toppings: [{ type: String }]
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, unique: true },
  items: [itemSchema],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  deliveryAddress: {
    recipientName: { type: String },
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    phone: { type: String }
  },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PAID' },
  paymentDetails: {
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String, unique: true, sparse: true, index: true },
    razorpaySignature: { type: String }
  },
  orderStatus: { type: String, enum: ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled'], default: 'Order Received' },
  statusHistory: [{
    status: { type: String },
    timestamp: { type: Date }
  }]
}, { timestamps: true });

orderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = 'CC-' + (100000 + count + 1);
  }
  next();
});

orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
