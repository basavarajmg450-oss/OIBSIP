const express = require('express');
const {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  resendVerification,
} = require('../controllers/authController');
const {
  validateRegistration,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} = require('../validators/authValidator');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(authLimiter);

router.post('/register', validateRegistration, register);
router.get('/verify-email', verifyEmail);
router.post('/login', validateLogin, login);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);
router.post('/resend-verification', resendVerification);

// DEV-ONLY: exposes the raw verification token for automated testing.
// Completely disabled in production.
if (process.env.NODE_ENV !== 'production') {
  const User = require('../models/User');
  router.get('/debug-token', async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'user not found' });
    res.json({
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      token: user.verificationToken || null,
      tokenExpiry: user.verificationTokenExpiry || null,
    });
  });
}

module.exports = router;
