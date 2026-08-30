const { sendEmail } = require('../config/nodemailer');

const sendVerificationEmail = async (user, token) => {
  const email = typeof user === 'string' ? user : user.email;
  const name = typeof user === 'string' ? 'Pizza Lover' : (user.name || user.firstName || 'Pizza Lover');
  const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #ff5722; text-align: center;">Welcome to CrustCraft! 🍕</h2>
      <p>Hi ${name},</p>
      <p>Thanks for creating an account with CrustCraft. Please verify your email address to active your account and start ordering delicious, artisan pizzas.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyLink}" style="background-color: #ff5722; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="color: #555; background: #f9f9f9; padding: 10px; border-radius: 4px; font-size: 14px; word-break: break-all;">${verifyLink}</p>
      <p style="font-size: 13px; color: #666;">This link is valid for 24 hours. If you didn't create an account, you can safely ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
      <p style="color: #888; font-size: 11px; text-align: center;">© ${new Date().getFullYear()} CrustCraft Pizza Delivery. All rights reserved.</p>
    </div>
  `;

  await sendEmail(email, 'Verify your CrustCraft Account 🍕', html);
};

const sendPasswordResetEmail = async (user, token) => {
  const email = typeof user === 'string' ? user : user.email;
  const name = typeof user === 'string' ? 'Pizza Lover' : (user.name || user.firstName || 'Pizza Lover');
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #ff5722; text-align: center;">CrustCraft Password Reset 🔒</h2>
      <p>Hi ${name},</p>
      <p>You requested a password reset for your CrustCraft account. Click the button below to set a new password.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #ff5722; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="color: #555; background: #f9f9f9; padding: 10px; border-radius: 4px; font-size: 14px; word-break: break-all;">${resetLink}</p>
      <p style="font-size: 13px; color: #666;">This link is valid for 1 hour. If you didn't request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
      <p style="color: #888; font-size: 11px; text-align: center;">© ${new Date().getFullYear()} CrustCraft Pizza Delivery. All rights reserved.</p>
    </div>
  `;

  await sendEmail(email, 'Reset your CrustCraft Password 🔒', html);
};

const sendLowStockAlert = async (items) => {
  if (!items || items.length === 0) return;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.category}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; color: red; font-weight: bold;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.threshold}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${item.threshold * 2}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #d32f2f; text-align: center;">⚠️ CrustCraft Low Stock Alert</h2>
      <p>The following inventory items have fallen below their minimum threshold and require immediate restocking:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f5f5f5; text-align: left;">
            <th style="padding: 10px; border-bottom: 2px solid #ddd;">Item Name</th>
            <th style="padding: 10px; border-bottom: 2px solid #ddd;">Category</th>
            <th style="padding: 10px; border-bottom: 2px solid #ddd;">Current Qty</th>
            <th style="padding: 10px; border-bottom: 2px solid #ddd;">Threshold</th>
            <th style="padding: 10px; border-bottom: 2px solid #ddd;">Rec. Restock</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <p>Please log in to the admin dashboard to update inventory levels after restocking.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
      <p style="color: #888; font-size: 11px; text-align: center;">Automated Admin Notification System - CrustCraft</p>
    </div>
  `;

  await sendEmail(
    process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@crustcraft.com',
    `⚠️ URGENT: Low Stock Alert - ${items.length} Items`,
    html
  );
};

const sendOrderConfirmationEmail = async (userOrOrder, orderDoc) => {
  let customerUser = null;
  let order = orderDoc;

  if (userOrOrder && typeof userOrOrder === 'object' && userOrOrder.email) {
    customerUser = userOrOrder;
    if (!order) order = userOrOrder;
  } else if (orderDoc && typeof orderDoc === 'object') {
    order = orderDoc;
  }

  // If customerUser is not passed or missing email, populate from MongoDB User model using order.user ID
  if ((!customerUser || !customerUser.email) && order && order.user) {
    const User = require('../models/User');
    if (typeof order.user === 'object' && order.user.email) {
      customerUser = order.user;
    } else {
      customerUser = await User.findById(order.user);
    }
  }

  const email = customerUser?.email;
  const name = customerUser?.name || 'Valued Customer';

  if (!email) {
    console.error('❌ Cannot send order confirmation email: authenticated customer email not found in database.');
    return;
  }

  const itemsHtml = (order.items || []).map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">₹${item.price * item.quantity}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #ff5722; text-align: center;">Order Confirmed! 🍕</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Thank you for your order! Your payment has been verified successfully and your delicious pizza is being prepared.</p>
      
      <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p style="margin: 5px 0;"><strong>Payment Status:</strong> <span style="color: green; font-weight: bold;">${order.paymentStatus || 'PAID'}</span></p>
        <p style="margin: 5px 0;"><strong>Razorpay Payment ID:</strong> ${order.paymentDetails?.razorpayPaymentId || 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>Order Status:</strong> ${order.orderStatus}</p>
      </div>

      <h3>Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
        <thead>
          <tr style="background-color: #f5f5f5; text-align: left;">
            <th style="padding: 10px; border-bottom: 2px solid #ddd;">Item</th>
            <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: center;">Qty</th>
            <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: right;">Price</th>
            <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="text-align: right; margin-top: 15px; font-size: 15px;">
        <p style="margin: 4px 0;">Subtotal: ₹${order.subtotal}</p>
        <p style="margin: 4px 0;">GST / Tax (18%): ₹${order.tax}</p>
        <p style="margin: 8px 0; font-size: 18px; font-weight: bold; color: #ff5722;">Total Amount: ₹${order.total}</p>
      </div>

      <hr style="border: none; border-top: 1px solid #eee; margin-top: 25px;" />
      <p style="font-size: 13px; color: #666; text-align: center;">CrustCraft Pizza Delivery — Fresh, Hot, Delivered Fast.</p>
    </div>
  `;

  try {
    await sendEmail(email, `Order Confirmed: ${order.orderNumber} 🍕`, html);
    console.log(`✉️ Order confirmation email sent to registered customer: ${email} for order ${order.orderNumber}`);
  } catch (err) {
    console.error(`⚠️ Order confirmation email failed for ${email}: ${err.message}`);
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendLowStockAlert,
  sendOrderConfirmationEmail
};
