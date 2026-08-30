import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Badge from '../Common/Badge';
import { formatPrice, formatDate, getStatusColor } from '../../utils/formatters';

export default function OrderCard({ order }) {
  const navigate = useNavigate();

  return (
    <div className="order-card" onClick={() => navigate(`/orders/${order._id}`)} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/orders/${order._id}`)}>
      <div className="order-card-info">
        <h4>Order #{order.orderNumber}</h4>
        <div className="order-card-meta">
          <span>{order.items?.length || 0} item(s)</span>
          <span>{formatDate(order.createdAt)}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
          {order.paymentStatus || 'PAID'}
        </Badge>
        <Badge variant={getStatusColor(order.orderStatus)}>{order.orderStatus}</Badge>
        <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>{formatPrice(order.total)}</span>
        <ChevronRight size={18} color="var(--color-text-muted)" />
      </div>
    </div>
  );
}
