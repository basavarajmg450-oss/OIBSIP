import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Truck, ChefHat, Shield, ArrowRight } from 'lucide-react';
import PizzaCard from '../components/Pizza/PizzaCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { getAllPizzas } from '../services/pizzaService';

export default function Home() {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPizzas().then(res => setPizzas(res.data.data?.slice(0, 4) || []))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fadeIn">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true"></div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-tag">🔥 Fresh from the oven, every time</div>
            <h1>Craft Your <span className="highlight">Perfect Pizza</span></h1>
            <p>Premium artisan pizzas made with hand-picked ingredients, baked to perfection and delivered hot to your doorstep. Build your own masterpiece or explore our curated menu.</p>
            <div className="hero-actions">
              <Link to="/menu" className="btn btn-primary btn-lg">
                Explore Menu <ArrowRight size={18} />
              </Link>
              <Link to="/custom-pizza" className="btn btn-outline btn-lg">
                Build Custom Pizza
              </Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <h3>50+</h3>
                <p>Fresh Toppings</p>
              </div>
              <div className="hero-stat">
                <h3>30min</h3>
                <p>Avg Delivery</p>
              </div>
              <div className="hero-stat">
                <h3>10K+</h3>
                <p>Happy Customers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div className="section-title">
            <h2>Why CrustCraft?</h2>
            <p>We&apos;re not just another pizza place. Here&apos;s what makes us special.</p>
          </div>
          <div className="features-grid">
            {[
              { icon: <Flame size={28} />, title: 'Fresh Ingredients', desc: 'Hand-selected premium ingredients sourced daily from local farms.' },
              { icon: <Truck size={28} />, title: 'Fast Delivery', desc: 'Hot pizza at your door in 30 minutes or less, guaranteed.' },
              { icon: <ChefHat size={28} />, title: 'Custom Builder', desc: 'Create your dream pizza with our interactive builder — your rules.' },
              { icon: <Shield size={28} />, title: 'Secure Payment', desc: 'Razorpay-powered secure checkout with real-time order tracking.' },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Pizzas */}
      <section className="container" style={{ paddingBottom: 'var(--space-16)' }}>
        <div className="section-title">
          <h2>Popular Picks</h2>
          <p>Our most loved pizzas, crafted to perfection.</p>
        </div>
        {loading ? (
          <LoadingSpinner message="Loading menu..." />
        ) : (
          <div className="grid grid-4">
            {pizzas.map(p => <PizzaCard key={p._id} pizza={p} />)}
          </div>
        )}
        <div className="text-center mt-8">
          <Link to="/menu" className="btn btn-outline">View Full Menu <ArrowRight size={16} /></Link>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to Craft Your Pizza?</h2>
            <p>Build your perfect pizza from scratch with our interactive customizer — choose your base, sauce, cheese, and toppings.</p>
            <Link to="/custom-pizza" className="btn btn-primary btn-lg">Start Building <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
