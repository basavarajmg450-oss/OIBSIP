import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, ShieldAlert } from 'lucide-react';
import { getPizzaById } from '../services/pizzaService';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { formatPrice } from '../utils/formatters';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const PIZZA_EMOJIS = { Veg: '🌿', 'Non-Veg': '🍖', Specialty: '⭐' };

export default function PizzaDetail() {
  const { id } = useParams();
  const [pizza, setPizza] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPizza = async () => {
      try {
        const res = await getPizzaById(id);
        setPizza(res.data.data);
      } catch (err) {
        setError('Pizza not found or server error.');
      } finally {
        setLoading(false);
      }
    };
    fetchPizza();
  }, [id]);

  const handleAddToCart = () => {
    if (!pizza) return;
    addToCart({
      id: pizza._id,
      name: pizza.name,
      price: pizza.basePrice,
      image: pizza.image,
      quantity,
      isCustom: false,
    });
    addToast(`${quantity} x ${pizza.name} added to cart!`, 'success');
    navigate('/cart');
  };

  if (loading) return <LoadingSpinner message="Fetching pizza details..." />;

  if (error || !pizza) {
    return (
      <div className="container page-wrapper text-center">
        <div style={{ fontSize: '64px', marginBottom: 'var(--space-4)' }}>❌</div>
        <h2>Error Loading Pizza</h2>
        <p className="text-muted mb-6">{error || 'Something went wrong.'}</p>
        <Link to="/menu" className="btn btn-primary">Back to Menu</Link>
      </div>
    );
  }

  return (
    <div className="container page-wrapper">
      <Link to="/menu" className="btn btn-ghost mb-6" style={{ display: 'inline-flex', paddingLeft: 0 }}>
        <ArrowLeft size={16} /> Back to Menu
      </Link>

      <div className="grid grid-2 animate-fadeIn" style={{ alignItems: 'center' }}>
        <div className="pizza-card-image" style={{ height: '360px', borderRadius: 'var(--radius-lg)', fontSize: '96px', overflow: 'hidden' }}>
          {pizza.image ? (
            <img src={pizza.image} alt={pizza.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span>{PIZZA_EMOJIS[pizza.category] || '🍕'}</span>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <span className="badge badge-primary mb-2">{pizza.category}</span>
            <h1 style={{ fontSize: 'var(--fs-3xl)', marginBottom: 'var(--space-2)' }}>{pizza.name}</h1>
            <p className="pizza-card-price" style={{ fontSize: 'var(--fs-2xl)' }}>{formatPrice(pizza.basePrice)}</p>
          </div>

          <p className="text-secondary" style={{ fontSize: 'var(--fs-md)', color: 'var(--color-text-secondary)' }}>
            {pizza.description}
          </p>

          {pizza.ingredients?.length > 0 && (
            <div>
              <h3 style={{ fontSize: 'var(--fs-sm)', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {pizza.ingredients.map((ing) => (
                  <span key={ing} className="badge badge-info">{ing}</span>
                ))}
              </div>
            </div>
          )}

          {!pizza.available && (
            <div className="flex gap-2" style={{ color: 'var(--color-danger)', alignItems: 'center' }}>
              <ShieldAlert size={20} />
              <span>Out of stock / Unavailable at the moment</span>
            </div>
          )}

          {pizza.available && (
            <div className="flex gap-4 mt-4 flex-wrap" style={{ alignItems: 'center' }}>
              <div className="quantity-controls">
                <button className="quantity-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Decrease quantity">
                  -
                </button>
                <span className="quantity-value" style={{ fontSize: 'var(--fs-md)' }}>{quantity}</span>
                <button className="quantity-btn" onClick={() => setQuantity(q => q + 1)} aria-label="Increase quantity">
                  +
                </button>
              </div>
              <button className="btn btn-primary" onClick={handleAddToCart} style={{ flex: 1 }}>
                <ShoppingCart size={18} /> Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
