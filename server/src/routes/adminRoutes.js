const express = require('express');
const {
  adminLogin,
  getDashboard,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus
} = require('../controllers/adminController');
const {
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/login', authLimiter, adminLogin);

router.use(protect);
router.use(adminOnly);

router.get('/dashboard', getDashboard);
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrderById);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/inventory', getInventory);
router.post('/inventory', addInventoryItem);
router.put('/inventory/:id', updateInventoryItem);
router.delete('/inventory/:id', deleteInventoryItem);

module.exports = router;
