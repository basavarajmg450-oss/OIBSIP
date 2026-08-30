const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize only if keys exist, avoiding crash on startup if not configured
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

const createRazorpayOrder = async (amount, orderId) => {
  if (!razorpay) throw new Error('Razorpay is not configured');

  const options = {
    amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
    currency: 'INR',
    receipt: orderId.toString(),
  };

  try {
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error('Payment gateway error');
  }
};

const verifyPaymentSignature = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  if (!process.env.RAZORPAY_KEY_SECRET) throw new Error('Razorpay secret not configured');
  
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');
    
  return expectedSignature === razorpay_signature;
};

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature
};
