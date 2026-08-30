import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import CartItem from '../components/Cart/CartItem';
import { formatPrice } from '../utils/formatters';

export default function Cart() {
  const { items, itemCount, subtotal, tax, total, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container page-wrapper text-center animate-fadeIn">
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h2>Your Cart is Empty</h2>
          <p className="text-muted mb-6">Looks like you haven&apos;t added any pizza to your cart yet. Let&apos;s change that!</p>
          <Link to="/menu" className="btn btn-primary">
            <ShoppingBag size={18} /> Browse Pizza Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-wrapper">
      <div className="page-header" style={{ textAlign: 'left', marginBottom: 'var(--space-8)' }}>
        <h1>Shopping Cart</h1>
        <p>You have {itemCount} item(s) in your cart.</p>
      </div>

      <div className="cart-page animate-fadeIn">
        <div className="flex flex-col gap-4">
          <div className="flex-between pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ fontWeight: 600 }}>Cart Items</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={clearCart}
              style={{ color: 'var(--color-danger)', padding: 0 }}
            >
              <Trash2 size={16} /> Clear All
            </button>
          </div>
          <div className="cart-items">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>GST / Tax (18%)</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>FREE</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span className="total-price">{formatPrice(total)}</span>
          </div>

          <button
            className="btn btn-primary w-full btn-lg mt-6"
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>
          <div className="text-center mt-4">
            <Link to="/menu" className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
