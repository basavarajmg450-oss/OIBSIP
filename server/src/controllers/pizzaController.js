const Pizza = require('../models/Pizza');
const Inventory = require('../models/Inventory');

const getAllPizzas = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = {};
    if (category) {
      query.category = category;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const pizzas = await Pizza.find(query);
    res.status(200).json({ success: true, message: 'Pizzas fetched successfully', data: pizzas });
  } catch (error) {
    next(error);
  }
};

const getPizzaById = async (req, res, next) => {
  try {
    const pizza = await Pizza.findById(req.params.id);
    if (!pizza) {
      return res.status(404).json({ success: false, message: 'Pizza not found' });
    }
    res.status(200).json({ success: true, message: 'Pizza fetched successfully', data: pizza });
  } catch (error) {
    next(error);
  }
};

const getCustomPizzaOptions = async (req, res, next) => {
  try {
    const categories = ['Base', 'Sauce', 'Cheese', 'Veggies', 'Meat'];
    const options = {};
    
    for (const cat of categories) {
      const items = await Inventory.find({ category: cat });
      options[cat] = items;
    }

    res.status(200).json({ success: true, message: 'Custom pizza options fetched successfully', data: options });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllPizzas, getPizzaById, getCustomPizzaOptions };
