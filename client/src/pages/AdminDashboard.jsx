import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Package, RotateCcw, CheckSquare, AlertTriangle, ArrowRight } from 'lucide-react';
import { getDashboard } from '../services/adminService';
import StatCard from '../components/Admin/StatCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Badge from '../components/Common/Badge';
import { formatPrice, formatDate, getStatusColor } from '../utils/formatters';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getDashboard();
        setData(res.data.data);
      } catch (err) {
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner message="Calculating dashboard statistics..." />;

  if (error || !data) {
    return (
      <div className="text-center" style={{ padding: 'var(--space-12)' }}>
        <h2>Error Loading Dashboard</h2>
        <p className="text-danger">{error || 'Something went wrong.'}</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="admin-header">
        <h1>Dashboard</h1>
        <p>Real-time metrics for CrustCraft pizzeria operations.</p>
      </div>

      <div className="stat-cards">
        <StatCard
          label="Total Revenue"
          value={formatPrice(data.revenue)}
          icon={<DollarSign size={24} />}
          variant="success"
        />
        <StatCard
          label="Total Orders"
          value={data.totalOrders}
          icon={<Package size={24} />}
        />
        <StatCard
          label="Pending Orders"
          value={data.pendingOrders}
          icon={<RotateCcw size={24} />}
          variant="warning"
        />
        <StatCard
          label="Completed Orders"
          value={data.completedOrders}
          icon={<CheckSquare size={24} />}
          variant="success"
        />
        <StatCard
          label="Low Stock Items"
          value={data.lowStockCount}
          icon={<AlertTriangle size={24} />}
          variant={data.lowStockCount > 0 ? 'danger' : ''}
        />
      </div>

      <div className="card">
        <div className="flex-between mb-4">
          <h3>Recent Orders</h3>
          <Link to="/admin/orders" className="btn btn-ghost btn-sm">
            Manage All Orders <ArrowRight size={14} />
          </Link>
        </div>

        {data.recentOrders?.length === 0 ? (
          <p className="text-muted">No orders found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total Price</th>
                  <th>Order Status</th>
                  <th>Payment</th>
                  <th>Placed Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map(order => (
                  <tr key={order._id}>
                    <td style={{ fontWeight: 600 }}>{order.orderNumber}</td>
                    <td>
                      <div>{order.deliveryAddress?.recipientName}</div>
                      <div className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}>{order.user?.email}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{formatPrice(order.total)}</td>
                    <td>
                      <Badge variant={getStatusColor(order.orderStatus)}>{order.orderStatus}</Badge>
                    </td>
                    <td>
                      <Badge variant={getStatusColor(order.paymentStatus)}>{order.paymentStatus}</Badge>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
