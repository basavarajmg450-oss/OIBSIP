const express = require('express');
const {
  getAllPizzas,
  getCustomPizzaOptions,
  getPizzaById,
} = require('../controllers/pizzaController');

const router = express.Router();

router.get('/', getAllPizzas);
router.get('/custom-options', getCustomPizzaOptions);
router.get('/:id', getPizzaById);

module.exports = router;
