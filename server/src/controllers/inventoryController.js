const Inventory = require('../models/Inventory');

const getInventory = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const inventory = await Inventory.find(query);
    res.status(200).json({ success: true, message: 'Inventory fetched successfully', data: inventory });
  } catch (error) {
    next(error);
  }
};

const addInventoryItem = async (req, res, next) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json({ success: true, message: 'Inventory item added successfully', data: item });
  } catch (error) {
    next(error);
  }
};

const updateInventoryItem = async (req, res, next) => {
  try {
    const { quantity, threshold, price, name } = req.body;
    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      { quantity, threshold, price, name },
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
    res.status(200).json({ success: true, message: 'Inventory item updated successfully', data: item });
  } catch (error) {
    next(error);
  }
};

const deleteInventoryItem = async (req, res, next) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
    res.status(200).json({ success: true, message: 'Inventory item deleted successfully', data: null });
  } catch (error) {
    next(error);
  }
};

module.exports = { getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem };
