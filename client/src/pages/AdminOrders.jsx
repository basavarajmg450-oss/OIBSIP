import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '../services/adminService';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Badge from '../components/Common/Badge';
import { formatPrice, formatDate, getStatusColor } from '../utils/formatters';

const STATUS_OPTIONS = ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);
  const { addToast } = useToast();

  const fetchOrdersList = async () => {
    try {
      const params = {};
      if (statusFilter !== 'All') {
        params.status = statusFilter;
      }
      const res = await getOrders(params);
      setOrders(res.data.data || []);
    } catch (err) {
      addToast('Failed to fetch orders.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersList();
  }, [statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      addToast(`Order status updated to: ${newStatus}`, 'success');
      // Update local state instantly
      setOrders(prev =>
        prev.map(order =>
          order._id === orderId
            ? {
                ...order,
                orderStatus: newStatus,
                statusHistory: [...(order.statusHistory || []), { status: newStatus, timestamp: new Date() }]
              }
            : order
        )
      );
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update order status.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="admin-header flex-between flex-wrap gap-4">
        <div>
          <h1>Order Management</h1>
          <p>Monitor customer orders and update tracking status live.</p>
        </div>
        <div>
          <select
            className="form-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching orders catalog..." />
      ) : orders.length === 0 ? (
        <div className="card text-center" style={{ padding: 'var(--space-12)' }}>
          <p className="text-muted">No orders match the selected filter.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowHidden: 'true' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer Details</th>
                  <th>Order Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Current Status</th>
                  <th>Update Status</th>
                  <th>Date Placed</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td style={{ fontWeight: 600 }}>{order.orderNumber}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.deliveryAddress?.recipientName}</div>
                      <div className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}>Phone: {order.deliveryAddress?.phone}</div>
                      <div className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}>{order.deliveryAddress?.street}, {order.deliveryAddress?.city}</div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1" style={{ fontSize: 'var(--fs-xs)' }}>
                        {order.items?.map((item, idx) => (
                          <div key={idx}>
                            <span>• {item.name}</span>
                            <span className="text-muted" style={{ marginLeft: '4px' }}>x{item.quantity}</span>
                            {item.isCustom && (
                              <div style={{ color: 'var(--color-primary-light)', paddingLeft: '8px' }}>
                                Crust: {item.customization?.base} | Sauce: {item.customization?.sauce}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{formatPrice(order.total)}</td>
                    <td>
                      <Badge variant={getStatusColor(order.paymentStatus)}>{order.paymentStatus}</Badge>
                    </td>
                    <td>
                      <Badge variant={getStatusColor(order.orderStatus)}>{order.orderStatus}</Badge>
                    </td>
                    <td>
                      <select
                        className="form-input"
                        style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--fs-xs)', width: '150px' }}
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
