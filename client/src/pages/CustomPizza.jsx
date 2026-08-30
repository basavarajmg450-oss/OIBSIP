import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShoppingCart, Check } from 'lucide-react';
import { getCustomPizzaOptions } from '../services/pizzaService';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { formatPrice } from '../utils/formatters';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const STEPS = [
  { id: 'base', label: 'Pizza Base' },
  { id: 'sauce', label: 'Pizza Sauce' },
  { id: 'cheese', label: 'Cheese Selection' },
  { id: 'toppings', label: 'Topping Selection' },
  { id: 'summary', label: 'Pizza Summary' }
];

export default function CustomPizza() {
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  // Selections
  const [selectedBase, setSelectedBase] = useState(null);
  const [selectedSauce, setSelectedSauce] = useState(null);
  const [selectedCheeses, setSelectedCheeses] = useState([]);
  const [selectedToppings, setSelectedToppings] = useState([]);

  const { addToCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await getCustomPizzaOptions();
        setOptions(res.data.data);
        // Set defaults from loaded data
        if (res.data.data?.Base?.length > 0) setSelectedBase(res.data.data.Base[0]);
        if (res.data.data?.Sauce?.length > 0) setSelectedSauce(res.data.data.Sauce[0]);
      } catch (err) {
        setError('Failed to load custom pizza builder options.');
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, []);

  // Price calculations
  const basePrice = 149; // Flat base price for dough prep
  const getSelectedPrice = () => {
    let total = basePrice;
    if (selectedBase) total += selectedBase.price || 0;
    if (selectedSauce) total += selectedSauce.price || 0;
    selectedCheeses.forEach(c => total += c.price || 0);
    selectedToppings.forEach(t => total += t.price || 0);
    return total;
  };

  const handleCheeseToggle = (cheeseItem) => {
    setSelectedCheeses(prev =>
      prev.some(c => c._id === cheeseItem._id)
        ? prev.filter(c => c._id !== cheeseItem._id)
        : [...prev, cheeseItem]
    );
  };

  const handleToppingToggle = (toppingItem) => {
    setSelectedToppings(prev =>
      prev.some(t => t._id === toppingItem._id)
        ? prev.filter(t => t._id !== toppingItem._id)
        : [...prev, toppingItem]
    );
  };

  const handleAddToCart = () => {
    if (!selectedBase || !selectedSauce) {
      addToast('Please select a base and a sauce first!', 'warning');
      return;
    }

    const price = getSelectedPrice();
    const customization = {
      base: selectedBase.name,
      sauce: selectedSauce.name,
      cheeses: selectedCheeses.map(c => c.name),
      toppings: selectedToppings.map(t => t.name)
    };

    addToCart({
      id: `custom-${Date.now()}`,
      name: `Custom Pizza (${selectedBase.name})`,
      price,
      isCustom: true,
      customization,
      quantity: 1,
      image: null
    });

    addToast('Custom pizza added to cart!', 'success');
    navigate('/cart');
  };

  if (loading) return <LoadingSpinner message="Opening CrustCraft builder..." />;

  if (error || !options) {
    return (
      <div className="container page-wrapper text-center">
        <div style={{ fontSize: '64px', marginBottom: 'var(--space-4)' }}>❌</div>
        <h2>Builder Unavailable</h2>
        <p className="text-muted mb-6">{error || 'Something went wrong.'}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const currentStepId = STEPS[currentStep].id;

  return (
    <div className="container page-wrapper">
      <div className="page-header">
        <h1>CrustCraft Builder</h1>
        <p>Choose your base, sauce, cheese, and toppings to create your perfect artisanal pizza.</p>
      </div>

      <div className="builder-container">
        {/* Progress Bar */}
        <div className="builder-progress">
          {STEPS.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div className="builder-step">
                <div className={`step-number ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}>
                  {idx < currentStep ? <Check size={16} /> : idx + 1}
                </div>
                <span className="step-label" style={{ display: idx === currentStep ? 'inline' : 'none' }}>{step.label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`step-connector ${idx < currentStep ? 'active' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Contents */}
        <div className="mb-8 animate-fadeIn" style={{ minHeight: '300px' }}>
          {currentStepId === 'base' && (
            <div>
              <h2 className="mb-4 text-center">Select Pizza Crust</h2>
              <div className="builder-options">
                {options.Base?.map(b => (
                  <div
                    key={b._id}
                    className={`option-card ${selectedBase?._id === b._id ? 'selected' : ''}`}
                    onClick={() => setSelectedBase(b)}
                  >
                    <div className="option-card-name">{b.name}</div>
                    <div className="option-card-price">+{formatPrice(b.price)}</div>
                    <div className="text-muted" style={{ fontSize: 'var(--fs-xs)', marginTop: '4px' }}>
                      Stock: {b.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStepId === 'sauce' && (
            <div>
              <h2 className="mb-4 text-center">Select Sauce</h2>
              <div className="builder-options">
                {options.Sauce?.map(s => (
                  <div
                    key={s._id}
                    className={`option-card ${selectedSauce?._id === s._id ? 'selected' : ''}`}
                    onClick={() => setSelectedSauce(s)}
                  >
                    <div className="option-card-name">{s.name}</div>
                    <div className="option-card-price">+{formatPrice(s.price)}</div>
                    <div className="text-muted" style={{ fontSize: 'var(--fs-xs)', marginTop: '4px' }}>
                      Stock: {s.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStepId === 'cheese' && (
            <div>
              <h2 className="mb-4 text-center">Add Cheese (Optional)</h2>
              <div className="builder-options">
                {options.Cheese?.map(c => {
                  const isSelected = selectedCheeses.some(item => item._id === c._id);
                  return (
                    <div
                      key={c._id}
                      className={`option-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleCheeseToggle(c)}
                    >
                      <div className="option-card-name">{c.name}</div>
                      <div className="option-card-price">+{formatPrice(c.price)}</div>
                      <div className="text-muted" style={{ fontSize: 'var(--fs-xs)', marginTop: '4px' }}>
                        Stock: {c.quantity}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentStepId === 'toppings' && (
            <div>
              <h2 className="mb-4 text-center">Select Veg &amp; Meat Toppings (Optional)</h2>
              <div className="builder-options">
                {[...(options.Veggies || []), ...(options.Meat || [])]?.map(t => {
                  const isSelected = selectedToppings.some(item => item._id === t._id);
                  return (
                    <div
                      key={t._id}
                      className={`option-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleToppingToggle(t)}
                    >
                      <div className="option-card-name">{t.name}</div>
                      <div className="option-card-price">+{formatPrice(t.price)}</div>
                      <div className="text-muted" style={{ fontSize: 'var(--fs-xs)', marginTop: '4px' }}>
                        Stock: {t.quantity}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentStepId === 'summary' && (
            <div className="builder-summary animate-fadeIn">
              <h2 className="mb-4 text-center">Your Customized Pizza</h2>
              <div className="flex flex-col gap-3">
                <div className="flex-between pb-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <span>Prep/Dough Cost</span>
                  <span style={{ fontWeight: 600 }}>{formatPrice(basePrice)}</span>
                </div>
                {selectedBase && (
                  <div className="flex-between pb-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <span>Crust: {selectedBase.name}</span>
                    <span style={{ fontWeight: 600 }}>+{formatPrice(selectedBase.price)}</span>
                  </div>
                )}
                {selectedSauce && (
                  <div className="flex-between pb-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <span>Sauce: {selectedSauce.name}</span>
                    <span style={{ fontWeight: 600 }}>+{formatPrice(selectedSauce.price)}</span>
                  </div>
                )}
                {selectedCheeses.length > 0 && (
                  <div className="flex flex-col gap-1 pb-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-secondary)' }}>Extra Cheese:</span>
                    {selectedCheeses.map(c => (
                      <div key={c._id} className="flex-between pl-4">
                        <span>{c.name}</span>
                        <span>+{formatPrice(c.price)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {selectedToppings.length > 0 && (
                  <div className="flex flex-col gap-1 pb-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-secondary)' }}>Toppings:</span>
                    {selectedToppings.map(t => (
                      <div key={t._id} className="flex-between pl-4">
                        <span>{t.name}</span>
                        <span>+{formatPrice(t.price)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pricing Panel and Controls */}
        <div className="flex-between flex-wrap gap-4 mt-6 pt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="builder-total">
            <span style={{ marginRight: 'var(--space-4)', fontSize: 'var(--fs-md)', color: 'var(--color-text-secondary)' }}>Current Price:</span>
            <span className="builder-total-price">{formatPrice(getSelectedPrice())}</span>
          </div>

          <div className="builder-nav gap-3">
            {currentStep > 0 && (
              <button className="btn btn-outline" onClick={() => setCurrentStep(curr => curr - 1)}>
                <ArrowLeft size={16} /> Back
              </button>
            )}

            {currentStep < STEPS.length - 1 ? (
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (currentStep === 0 && !selectedBase) {
                    addToast('Please select a base to continue!', 'warning');
                    return;
                  }
                  if (currentStep === 1 && !selectedSauce) {
                    addToast('Please select a sauce to continue!', 'warning');
                    return;
                  }
                  setCurrentStep(curr => curr + 1);
                }}
              >
                Next Step <ArrowRight size={16} />
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleAddToCart}>
                <ShoppingCart size={16} /> Add Custom Pizza to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
