const express = require('express');
const { getMe, updateMe } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/me', getMe);
router.put('/me', updateMe);

module.exports = router;
