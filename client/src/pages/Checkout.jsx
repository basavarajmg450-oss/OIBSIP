import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { confirmOrder } from '../services/orderService';
import { createPaymentSession, verifyPayment } from '../services/paymentService';
import { formatPrice } from '../utils/formatters';
import { validatePhone } from '../utils/validators';
import LoadingSpinner from '../components/Common/LoadingSpinner';

export default function Checkout() {
  const { items, subtotal, tax, total, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    recipientName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Pre-populate user address and name if available
  useEffect(() => {
    if (user) {
      setForm({
        recipientName: user.name || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        phone: user.address?.phone || ''
      });
    }
  }, [user]);

  // Load Razorpay Checkout script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const validate = () => {
    const e = {};
    if (!form.recipientName.trim()) e.recipientName = 'Recipient name is required';
    if (!form.street.trim()) e.street = 'Street address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.state.trim()) e.state = 'State is required';
    if (!form.zipCode.trim()) e.zipCode = 'ZIP Code is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!validatePhone(form.phone)) e.phone = 'Invalid 10-digit phone number';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) {
      addToast('Your cart is empty', 'warning');
      return;
    }

    setLoading(true);
    try {
      // 1. Create Payment Session on backend (PENDING Payment status, NO Order created yet)
      const checkoutPayload = {
        items: items.map(i => ({
          pizza: i.isCustom ? null : (i.pizza || i.id),
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          isCustom: i.isCustom,
          customization: i.isCustom ? i.customization : undefined,
          customIngredients: i.isCustom ? i.customIngredients : undefined
        })),
        deliveryAddress: form
      };

      const sessionRes = await createPaymentSession(checkoutPayload);
      const { razorpay_order_id, razorpay_key_id, amount, currency, paymentSessionId } = sessionRes.data.data;

      // 2. Load Razorpay Checkout SDK
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        addToast('Razorpay SDK failed to load. Are you online?', 'error');
        setLoading(false);
        return;
      }

      // 3. Open Razorpay Checkout modal with real UPI/QR/Card payment options
      const options = {
        key: razorpay_key_id,
        amount,
        currency,
        name: 'CrustCraft Pizza',
        description: 'Pizza Delivery Payment',
        order_id: razorpay_order_id,
        handler: async (response) => {
          setLoading(true);
          try {
            // 4. Verify payment signature on backend
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            };
            const verificationRes = await verifyPayment(verifyPayload);

            if (verificationRes.data.success) {
              // 5. Confirm Order ONLY after successful server-side payment verification
              const confirmPayload = {
                razorpay_payment_id: response.razorpay_payment_id,
                paymentId: verificationRes.data.data.paymentId || paymentSessionId
              };
              const confirmRes = await confirmOrder(confirmPayload);

              const confirmedOrder = confirmRes.data.data;
              addToast('Payment verified! Order placed successfully. 🍕', 'success');
              clearCart();
              navigate(`/order/${confirmedOrder._id}`);
            } else {
              addToast('Payment verification failed: invalid signature.', 'error');
            }
          } catch (err) {
            addToast(err.response?.data?.message || 'Payment verification or order confirmation failed.', 'error');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user?.name || form.recipientName || '',
          email: user?.email || '',
          contact: form.phone
        },
        theme: {
          color: '#FF6B35'
        },
        modal: {
          ondismiss: () => {
            addToast('Payment was cancelled. Your order was not placed.', 'info');
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        addToast(`Payment failed: ${response.error.description || 'Transaction declined'}`, 'error');
        setLoading(false);
      });
      rzp.open();

    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to initiate checkout session.', 'error');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container page-wrapper text-center">
        <h2>Your Cart is Empty</h2>
        <p className="text-muted mb-6">Add items to your cart before checking out.</p>
        <Link to="/menu" className="btn btn-primary">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="container page-wrapper">
      <div className="page-header" style={{ textAlign: 'left', marginBottom: 'var(--space-8)' }}>
        <h1>Checkout</h1>
        <p>Complete your delivery address and payment to place the order.</p>
      </div>

      {loading && <LoadingSpinner message="Processing your payment checkout..." />}

      <div className="checkout-page animate-fadeIn" style={{ display: loading ? 'none' : 'grid' }}>
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          <h2>Delivery Address</h2>
          <div className="form-group">
            <label className="form-label" htmlFor="recipientName">Recipient Full Name</label>
            <input
              type="text"
              id="recipientName"
              className={`form-input ${errors.recipientName ? 'error' : ''}`}
              placeholder="Who is receiving the pizza?"
              value={form.recipientName}
              onChange={e => setForm({ ...form, recipientName: e.target.value })}
            />
            {errors.recipientName && <p className="form-error">{errors.recipientName}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="street">Street Address</label>
            <input
              type="text"
              id="street"
              className={`form-input ${errors.street ? 'error' : ''}`}
              placeholder="Flat/House No, Building, Street Name"
              value={form.street}
              onChange={e => setForm({ ...form, street: e.target.value })}
            />
            {errors.street && <p className="form-error">{errors.street}</p>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                className={`form-input ${errors.city ? 'error' : ''}`}
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
              />
              {errors.city && <p className="form-error">{errors.city}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                className={`form-input ${errors.state ? 'error' : ''}`}
                value={form.state}
                onChange={e => setForm({ ...form, state: e.target.value })}
              />
              {errors.state && <p className="form-error">{errors.state}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="zipCode">ZIP Code</label>
              <input
                type="text"
                id="zipCode"
                className={`form-input ${errors.zipCode ? 'error' : ''}`}
                placeholder="400001"
                value={form.zipCode}
                onChange={e => setForm({ ...form, zipCode: e.target.value })}
              />
              {errors.zipCode && <p className="form-error">{errors.zipCode}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                className={`form-input ${errors.phone ? 'error' : ''}`}
                placeholder="10-digit number"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
              {errors.phone && <p className="form-error">{errors.phone}</p>}
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full btn-lg mt-4">
            Pay {formatPrice(total)} (Razorpay Gateway)
          </button>
        </form>

        <div className="order-summary">
          <h3>Your Order</h3>
          <div className="flex flex-col gap-3 mb-6 max-h-60" style={{ overflowY: 'auto' }}>
            {items.map(i => (
              <div key={i.id} className="flex-between">
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--fs-sm)' }}>{i.name}</div>
                  <div className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}>Qty: {i.quantity}</div>
                </div>
                <div style={{ fontWeight: 600 }}>{formatPrice(i.price * i.quantity)}</div>
              </div>
            ))}
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>GST / Tax (18%)</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span className="total-price">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
