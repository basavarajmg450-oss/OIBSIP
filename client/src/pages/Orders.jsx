import React, { useState, useEffect } from 'react';
import { getUserOrders } from '../services/orderService';
import OrderCard from '../components/Order/OrderCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getUserOrders();
        setOrders(res.data.data || []);
      } catch (err) {
        setError('Failed to load your order history.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="container page-wrapper">
      <div className="page-header" style={{ textAlign: 'left', marginBottom: 'var(--space-8)' }}>
        <h1>Order History</h1>
        <p>View details and track current status of all your orders.</p>
      </div>

      {error && (
        <div className="text-center text-danger mb-6 animate-fadeIn">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading orders..." />
      ) : orders.length === 0 ? (
        <div className="empty-state animate-fadeIn">
          <div className="empty-state-icon">📦</div>
          <h3>No Orders Found</h3>
          <p className="text-muted">You haven&apos;t ordered anything from CrustCraft yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
