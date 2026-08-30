const express = require('express');
const {
  createOrder,
  confirmOrder,
  getUserOrders,
  getOrderById,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/confirm', confirmOrder);
router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);

module.exports = router;
