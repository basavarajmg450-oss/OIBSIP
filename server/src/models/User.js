const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  phone: { type: String }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  isEmailVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpiry: { type: Date },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  address: addressSchema
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
