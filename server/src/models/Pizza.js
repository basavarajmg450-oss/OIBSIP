const mongoose = require('mongoose');

const pizzaSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  image: { type: String },
  category: { type: String, enum: ['Veg', 'Non-Veg', 'Specialty'], default: 'Veg' },
  basePrice: { type: Number, required: true },
  ingredients: [{ type: String }],
  available: { type: Boolean, default: true }
}, { timestamps: true });

pizzaSchema.index({ category: 1 });
pizzaSchema.index({ available: 1 });

module.exports = mongoose.model('Pizza', pizzaSchema);
