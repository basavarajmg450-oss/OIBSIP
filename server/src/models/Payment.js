const mongoose = require('mongoose');

const paymentItemSchema = new mongoose.Schema({
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

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  razorpayOrderId: { type: String, required: true, unique: true, index: true },
  razorpayPaymentId: { type: String, unique: true, sparse: true, index: true },
  razorpaySignature: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED', 'CANCELLED'],
    default: 'PENDING',
    index: true
  },
  items: [paymentItemSchema],
  deliveryAddress: {
    recipientName: { type: String },
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    phone: { type: String }
  },
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  webhookProcessedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
