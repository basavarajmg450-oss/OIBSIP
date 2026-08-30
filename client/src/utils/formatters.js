export const formatPrice = (amount) => {
  return `₹${Number(amount).toFixed(2)}`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

export const formatOrderNumber = (num) => num || 'N/A';

export const truncateText = (text, length = 80) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

export const getStatusColor = (status) => {
  const map = {
    'Order Received': 'info',
    'In Kitchen': 'warning',
    'Sent to Delivery': 'primary',
    'Delivered': 'success',
    'Cancelled': 'danger',
    'PAID': 'success',
    'PENDING': 'warning',
    'FAILED': 'danger',
  };
  return map[status] || 'info';
};
