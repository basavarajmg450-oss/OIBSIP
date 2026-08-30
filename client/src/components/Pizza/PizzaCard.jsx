import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';
import { formatPrice } from '../../utils/formatters';

const PIZZA_EMOJIS = { 'Veg': '🌿', 'Non-Veg': '🍖', 'Specialty': '⭐' };

export default function PizzaCard({ pizza }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart({
      id: pizza._id,
      name: pizza.name,
      price: pizza.basePrice,
      image: pizza.image,
      quantity: 1,
      isCustom: false,
    });
    addToast(`${pizza.name} added to cart!`, 'success');
  };

  return (
    <div
      className="pizza-card animate-slideUp"
      onClick={() => navigate(`/pizza/${pizza._id}`)}
      role="button"
      tabIndex={0}
      aria-label={`View ${pizza.name} details`}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/pizza/${pizza._id}`)}
    >
      <div className="pizza-card-image" aria-hidden="true">
        {pizza.image ? (
          <img src={pizza.image} alt={pizza.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span>{PIZZA_EMOJIS[pizza.category] || '🍕'}</span>
        )}
      </div>
      <div className="pizza-card-body">
        <div className="pizza-card-category">{pizza.category}</div>
        <h3 className="pizza-card-name">{pizza.name}</h3>
        <p className="pizza-card-desc">{pizza.description}</p>
        <div className="pizza-card-footer">
          <span className="pizza-card-price">{formatPrice(pizza.basePrice)}</span>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleAddToCart}
            aria-label={`Add ${pizza.name} to cart`}
            disabled={!pizza.available}
          >
            <ShoppingCart size={14} />
            {pizza.available ? 'Add' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
}
