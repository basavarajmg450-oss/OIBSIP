import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserOrders } from '../services/orderService';
import OrderCard from '../components/Order/OrderCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getUserOrders();
        // Show last 3 orders on the dashboard
        setOrders(res.data.data?.slice(0, 3) || []);
      } catch (err) {
        setError('Failed to fetch recent orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="container page-wrapper">
      <div className="page-header" style={{ textAlign: 'left', marginBottom: 'var(--space-8)' }}>
        <h1>Welcome, {user?.name}!</h1>
        <p className="text-muted">Manage your profile, view order history, and check order tracking in real-time.</p>
      </div>

      <div className="grid grid-3 mb-10">
        <div className="card text-center flex flex-col flex-center gap-2">
          <div style={{ fontSize: '32px' }}>🍕</div>
          <h3>Hungry?</h3>
          <p className="text-muted" style={{ fontSize: 'var(--fs-sm)' }}>Check out our fresh variety of custom and classic pizzas.</p>
          <Link to="/menu" className="btn btn-primary btn-sm mt-2">Order Now</Link>
        </div>
        <div className="card text-center flex flex-col flex-center gap-2">
          <div style={{ fontSize: '32px' }}>🛠️</div>
          <h3>Customize</h3>
          <p className="text-muted" style={{ fontSize: 'var(--fs-sm)' }}>Build your own pizza with selected crust, sauce, cheese, and toppings.</p>
          <Link to="/custom-pizza" className="btn btn-outline btn-sm mt-2">Open Builder</Link>
        </div>
        <div className="card text-center flex flex-col flex-center gap-2">
          <div style={{ fontSize: '32px' }}>👤</div>
          <h3>Profile Info</h3>
          <p className="text-muted" style={{ fontSize: 'var(--fs-sm)' }}>{user?.email}<br />{user?.address?.phone || 'No phone set'}</p>
          <Link to="/profile" className="btn btn-ghost btn-sm mt-2">Edit Profile</Link>
        </div>
      </div>

      <div>
        <h2 className="mb-4">Recent Orders</h2>
        {error && <p className="text-danger mb-4">{error}</p>}

        {loading ? (
          <LoadingSpinner size="md" message="Fetching your orders..." />
        ) : orders.length === 0 ? (
          <div className="card text-center" style={{ padding: 'var(--space-10)' }}>
            <p className="text-muted mb-4">You haven&apos;t placed any orders yet.</p>
            <Link to="/menu" className="btn btn-primary btn-sm">Place Your First Order</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4 animate-fadeIn">
            {orders.map(order => (
              <OrderCard key={order._id} order={order} />
            ))}
            <div className="text-center mt-2">
              <Link to="/orders" className="btn btn-ghost btn-sm">View All Orders</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
