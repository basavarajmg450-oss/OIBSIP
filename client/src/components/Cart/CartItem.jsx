import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import { useCart } from '../../hooks/useCart';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="cart-item">
      <div className="cart-item-image" aria-hidden="true">🍕</div>
      <div className="cart-item-details">
        <h4 className="cart-item-name">{item.name}</h4>
        {item.isCustom && item.customization && (
          <p className="cart-item-custom">
            {item.customization.base} • {item.customization.sauce}
            {item.customization.cheeses?.length > 0 && ` • ${item.customization.cheeses.join(', ')}`}
            {item.customization.toppings?.length > 0 && ` • ${item.customization.toppings.join(', ')}`}
          </p>
        )}
        <span className="cart-item-price">{formatPrice(item.price)}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-3)' }}>
        <div className="quantity-controls">
          <button className="quantity-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease quantity">
            <Minus size={14} />
          </button>
          <span className="quantity-value">{item.quantity}</span>
          <button className="quantity-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity">
            <Plus size={14} />
          </button>
        </div>
        <button className="btn-icon" onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name}`} style={{ color: 'var(--color-danger)' }}>
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
