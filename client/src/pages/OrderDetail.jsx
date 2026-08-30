import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Receipt, ShieldCheck } from 'lucide-react';
import { getOrderById } from '../services/orderService';
import { SocketContext } from '../context/SocketContext';
import { useToast } from '../hooks/useToast';
import OrderStatusTracker from '../components/Order/OrderStatusTracker';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Badge from '../components/Common/Badge';
import { formatPrice, formatDate, getStatusColor } from '../utils/formatters';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  const { socket, joinOrderRoom, leaveOrderRoom } = useContext(SocketContext);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderById(id);
        setOrder(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // Join Room for real-time Socket.io updates
  useEffect(() => {
    if (!id) return;
    joinOrderRoom(id);

    if (socket) {
      const handleStatusUpdate = (updatedOrder) => {
        if (updatedOrder._id === id) {
          setOrder(updatedOrder);
          addToast(`Order status updated to: ${updatedOrder.orderStatus}`, 'info');
        }
      };

      socket.on('orderStatusUpdated', handleStatusUpdate);

      return () => {
        socket.off('orderStatusUpdated', handleStatusUpdate);
        leaveOrderRoom(id);
      };
    }
  }, [id, socket, joinOrderRoom, leaveOrderRoom, addToast]);

  if (loading) return <LoadingSpinner message="Fetching order status..." />;

  if (error || !order) {
    return (
      <div className="container page-wrapper text-center">
        <div style={{ fontSize: '64px', marginBottom: 'var(--space-4)' }}>❌</div>
        <h2>Order Not Found</h2>
        <p className="text-muted mb-6">{error || 'The requested order details could not be retrieved.'}</p>
        <Link to="/orders" className="btn btn-primary">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="container page-wrapper">
      <Link to="/orders" className="btn btn-ghost mb-6" style={{ display: 'inline-flex', paddingLeft: 0 }}>
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="page-header" style={{ textAlign: 'left', marginBottom: 'var(--space-6)' }}>
        <div className="flex-between flex-wrap gap-2">
          <div>
            <h1>Order #{order.orderNumber}</h1>
            <p className="text-muted">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={getStatusColor(order.paymentStatus)}>Payment: {order.paymentStatus}</Badge>
            <Badge variant={getStatusColor(order.orderStatus)}>{order.orderStatus}</Badge>
          </div>
        </div>
      </div>

      {/* Socket live tracking notifier banner */}
      <div className="card mb-6 flex gap-3" style={{ background: 'rgba(0, 212, 170, 0.05)', borderColor: 'rgba(0, 212, 170, 0.2)', alignItems: 'center' }}>
        <Clock size={20} color="var(--color-success)" />
        <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-success)' }}>
          Real-time updates active. Any changes to your pizza status will reflect here live.
        </span>
      </div>

      {/* Tracker Visual Component */}
      <div className="card mb-8">
        <h3 className="mb-4">Order Status</h3>
        <OrderStatusTracker currentStatus={order.orderStatus} statusHistory={order.statusHistory} />
      </div>

      <div className="grid grid-2">
        {/* Items Breakdown */}
        <div className="flex flex-col gap-6">
          <div className="card">
            <h3 className="mb-4 flex gap-2" style={{ alignItems: 'center' }}><Receipt size={18} /> Items Ordered</h3>
            <div className="flex flex-col gap-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex-between pb-3" style={{ borderBottom: idx < order.items.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                    <span className="text-muted" style={{ fontSize: 'var(--fs-xs)', marginLeft: 'var(--space-2)' }}>x{item.quantity}</span>
                    {item.isCustom && item.customization && (
                      <p className="text-muted mt-1" style={{ fontSize: 'var(--fs-xs)' }}>
                        Base: {item.customization.base} • Sauce: {item.customization.sauce}
                        {item.customization.cheeses?.length > 0 && ` • Cheese: ${item.customization.cheeses.join(', ')}`}
                        {item.customization.toppings?.length > 0 && ` • Toppings: ${item.customization.toppings.join(', ')}`}
                      </p>
                    )}
                  </div>
                  <span style={{ fontWeight: 600 }}>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="mb-4 flex gap-2" style={{ alignItems: 'center' }}><ShieldCheck size={18} /> Payment Info</h3>
            <div className="flex flex-col gap-2" style={{ fontSize: 'var(--fs-sm)' }}>
              <div className="flex-between">
                <span className="text-muted">Payment Status:</span>
                <span style={{ fontWeight: 600 }} className={`text-${getStatusColor(order.paymentStatus)}`}>{order.paymentStatus}</span>
              </div>
              {order.paymentDetails?.razorpayOrderId && (
                <>
                  <div className="flex-between">
                    <span className="text-muted">Razorpay Order ID:</span>
                    <span>{order.paymentDetails.razorpayOrderId}</span>
                  </div>
                  {order.paymentDetails.razorpayPaymentId && (
                    <div className="flex-between">
                      <span className="text-muted">Razorpay Payment ID:</span>
                      <span>{order.paymentDetails.razorpayPaymentId}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Address and Pricing Summary */}
        <div className="flex flex-col gap-6">
          <div className="card">
            <h3 className="mb-4 flex gap-2" style={{ alignItems: 'center' }}><MapPin size={18} /> Delivery Details</h3>
            {order.deliveryAddress ? (
              <div style={{ fontSize: 'var(--fs-sm)' }}>
                <p style={{ fontWeight: 600, marginBottom: '4px' }}>{order.deliveryAddress.recipientName}</p>
                <p className="text-muted">{order.deliveryAddress.street}</p>
                <p className="text-muted">{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.zipCode}</p>
                <p className="text-muted mt-3">Phone: {order.deliveryAddress.phone}</p>
              </div>
            ) : (
              <p className="text-muted">Address details unavailable.</p>
            )}
          </div>

          <div className="card">
            <h3 className="mb-4">Order Total</h3>
            <div className="flex flex-col gap-2 pb-4 mb-4" style={{ borderBottom: '1px solid var(--color-border)', fontSize: 'var(--fs-sm)' }}>
              <div className="flex-between text-muted">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex-between text-muted">
                <span>GST / Tax (18%)</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="flex-between text-muted">
                <span>Delivery Charge</span>
                <span className="text-success" style={{ fontWeight: 600 }}>FREE</span>
              </div>
            </div>
            <div className="flex-between">
              <span style={{ fontWeight: 700 }}>Total Paid</span>
              <span className="pizza-card-price" style={{ fontSize: 'var(--fs-2xl)' }}>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
