const express = require('express');
const {
  createPaymentSession,
  verifyPayment,
  handleWebhook,
  createPaymentOrder
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public webhook route
router.post('/webhook', handleWebhook);

// Protected routes
router.use(protect);
router.post('/create-session', createPaymentSession);
router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);

module.exports = router;
