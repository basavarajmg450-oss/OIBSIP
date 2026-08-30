const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  category: { type: String, enum: ['Base', 'Sauce', 'Cheese', 'Veggies', 'Meat'], required: true },
  quantity: { type: Number, default: 100, min: 0 },
  threshold: { type: Number, default: 15 },
  unit: { type: String, default: 'units' },
  price: { type: Number, default: 0 },
  lastNotifiedAt: { type: Date }
}, { timestamps: true });

inventorySchema.index({ category: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);
