const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    // Token is generated with crypto — do NOT log it; it travels only via email.
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const user = await User.create({
      name,
      email,
      passwordHash,
      address: { phone },
      verificationToken,
      verificationTokenExpiry: tokenExpiry
    });

    // Attempt to send the verification email. If SMTP is misconfigured or delivery
    // fails, roll back the newly created user so the registration is not left in a
    // broken state (account exists but email is un-sendable).
    try {
      await emailService.sendVerificationEmail(user, user.verificationToken);
    } catch (emailErr) {
      console.error(`[REGISTER] Email delivery failed for ${email}: ${emailErr.message}`);
      // Roll back: delete the user so they can try again after fixing SMTP config.
      await User.findByIdAndDelete(user._id);
      return res.status(502).json({
        success: false,
        message: 'Registration failed: could not send verification email. Please try again later or contact support.',
      });
    }

    console.log(`[REGISTER] User created and verification email dispatched: ${email}`);
    res.status(201).json({
      success: true,
      message: 'Registration successful! A verification link has been sent to your email address.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    // Check both query param (GET) and request body (POST)
    const token = req.query.token || req.body.token;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required' });
    }

    // First check: is there a user with this exact token (regardless of expiry)
    // so we can give a specific "already verified" message instead of "invalid token"
    const userByToken = await User.findOne({ verificationToken: token });
    if (userByToken && userByToken.isEmailVerified) {
      // Token exists in DB but user is already verified — token wasn't cleared properly
      userByToken.verificationToken = undefined;
      userByToken.verificationTokenExpiry = undefined;
      await userByToken.save();
      return res.status(200).json({ success: true, message: 'Email is already verified. You can log in.' });
    }

    // Check if any already-verified user exists (covers the case where token was cleared)
    // We can't identify them by token if it was already cleared, so just proceed to normal check.

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      // Distinguish between expired vs completely invalid
      const expiredUser = await User.findOne({ verificationToken: token });
      if (expiredUser) {
        console.log(`[VERIFY] Token expired for: ${expiredUser.email}`);
        return res.status(400).json({ success: false, message: 'Verification link has expired. Please request a new one.' });
      }
      console.log('[VERIFY] Token not found in DB — invalid or already used');
      return res.status(400).json({ success: false, message: 'Invalid or already-used verification token. Please request a new link.' });
    }

    console.log(`[VERIFY] User found: ${user.email}`);
    console.log(`[VERIFY] isEmailVerified BEFORE update: ${user.isEmailVerified}`);

    // Set verified + invalidate token in a single atomic-like save
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    // Re-read from DB to confirm the write persisted
    const confirmedUser = await User.findById(user._id);
    console.log(`[VERIFY] isEmailVerified AFTER save (re-read from DB): ${confirmedUser.isEmailVerified}`);
    console.log(`[VERIFY] verificationToken AFTER save: ${confirmedUser.verificationToken}`);

    res.status(200).json({ success: true, message: 'Email verified successfully. You can now log in.', data: null });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(`[LOGIN] Attempt for: ${email}`);
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      console.log(`[LOGIN] User NOT found: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password FIRST — this prevents leaking account existence
    // to someone who only knows the email but not the password.
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      console.log(`[LOGIN] Password mismatch for: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Password is correct — now check email verification
    console.log(`[LOGIN] User found: ${email}, isEmailVerified: ${user.isEmailVerified}, _id: ${user._id}`);
    if (!user.isEmailVerified) {
      console.log(`[LOGIN] Email not verified for: ${email}`);
      return res.status(401).json({ success: false, message: 'Please verify your email first' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    const userData = user.toObject();
    delete userData.passwordHash;

    console.log(`[LOGIN] Success for: ${email}`);
    res.status(200).json({ success: true, message: 'Login successful', data: { token, user: userData } });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      // Return a generic message to avoid leaking whether the account exists.
      return res.status(200).json({ success: true, message: 'If that email is registered, a reset link has been sent.', data: null });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
    await user.save();

    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (emailErr) {
      console.error(`[FORGOT-PASSWORD] Email delivery failed for ${email}: ${emailErr.message}`);
      return res.status(502).json({
        success: false,
        message: 'Could not send password reset email. Please try again later.',
      });
    }

    res.status(200).json({ success: true, message: 'If that email is registered, a reset link has been sent.', data: null });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully', data: null });
  } catch (error) {
    next(error);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (user) {
      if (user.isEmailVerified) {
        return res.status(400).json({ success: false, message: 'Email is already verified' });
      }

      // Generate a fresh token — do NOT log it.
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

      user.verificationToken = verificationToken;
      user.verificationTokenExpiry = tokenExpiry;
      await user.save();

      try {
        await emailService.sendVerificationEmail(user, user.verificationToken);
      } catch (emailErr) {
        console.error(`[RESEND] Email delivery failed for ${user.email}: ${emailErr.message}`);
        return res.status(502).json({
          success: false,
          message: 'Could not send verification email. Please try again later.',
        });
      }
    }

    // Generic response — does not reveal whether the address is registered.
    res.status(200).json({
      success: true,
      message: 'If the email is registered and unverified, a new verification link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, verifyEmail, login, forgotPassword, resetPassword, resendVerification };
