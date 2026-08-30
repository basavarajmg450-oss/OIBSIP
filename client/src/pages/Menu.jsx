import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { getAllPizzas } from '../services/pizzaService';
import PizzaCard from '../components/Pizza/PizzaCard';
import CategoryFilter from '../components/Pizza/CategoryFilter';
import LoadingSpinner from '../components/Common/LoadingSpinner';

export default function Menu() {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPizzas = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (activeCategory !== 'All') {
          params.category = activeCategory;
        }
        if (search.trim()) {
          params.search = search.trim();
        }
        const res = await getAllPizzas(params);
        setPizzas(res.data.data || []);
      } catch (err) {
        setError('Failed to load pizza menu. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchPizzas();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [activeCategory, search]);

  return (
    <div className="container page-wrapper">
      <div className="page-header">
        <h1>Our Menu</h1>
        <p>Choose from our curated collection of delicious, artisanal pizzas.</p>
      </div>

      <div className="search-bar">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search for your favorite pizza..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search pizzas"
        />
      </div>

      <CategoryFilter active={activeCategory} onChange={setActiveCategory} />

      {error && (
        <div className="text-center text-danger mb-6 animate-fadeIn">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading pizza menu..." />
      ) : pizzas.length === 0 ? (
        <div className="empty-state animate-fadeIn">
          <div className="empty-state-icon">🍕</div>
          <h3>No Pizzas Found</h3>
          <p className="text-muted">We couldn&apos;t find any pizzas matching your criteria. Try adjusting your filter or search.</p>
        </div>
      ) : (
        <div className="grid grid-4 animate-fadeIn">
          {pizzas.map((pizza) => (
            <PizzaCard key={pizza._id} pizza={pizza} />
          ))}
        </div>
      )}
    </div>
  );
}
