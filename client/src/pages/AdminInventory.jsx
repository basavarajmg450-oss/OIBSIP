import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import { getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } from '../services/adminService';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Modal from '../components/Common/Modal';
import Badge from '../components/Common/Badge';
import { formatPrice } from '../utils/formatters';

const CATEGORY_TABS = ['All', 'Base', 'Sauce', 'Cheese', 'Veggies', 'Meat'];

export default function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const { addToast } = useToast();

  // Add Item Modal Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Base',
    quantity: 100,
    threshold: 15,
    unit: 'units',
    price: 0
  });

  // Edit Item Modal Form State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchInventoryItems = async () => {
    try {
      const params = {};
      if (activeTab !== 'All') {
        params.category = activeTab;
      }
      const res = await getInventory(params);
      setInventory(res.data.data || []);
    } catch (err) {
      addToast('Failed to fetch inventory catalog.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryItems();
  }, [activeTab]);

  const handleStockAdjust = async (id, currentQty, delta) => {
    const nextQty = Math.max(0, currentQty + delta);
    try {
      await updateInventoryItem(id, { quantity: nextQty });
      setInventory(prev =>
        prev.map(item => item._id === id ? { ...item, quantity: nextQty } : item)
      );
      addToast('Inventory stock updated successfully!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update stock.', 'error');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) {
      addToast('Item name is required.', 'warning');
      return;
    }
    try {
      const res = await addInventoryItem(newItem);
      addToast('Item added to inventory.', 'success');
      setIsAddOpen(false);
      // Reset form
      setNewItem({
        name: '',
        category: 'Base',
        quantity: 100,
        threshold: 15,
        unit: 'units',
        price: 0
      });
      fetchInventoryItems();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add item.', 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem?.name.trim()) {
      addToast('Item name is required.', 'warning');
      return;
    }
    try {
      await updateInventoryItem(editingItem._id, editingItem);
      addToast('Item updated successfully.', 'success');
      setIsEditOpen(false);
      fetchInventoryItems();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update item.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this item from the inventory?')) return;
    try {
      await deleteInventoryItem(id);
      addToast('Item deleted successfully.', 'success');
      setInventory(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete item.', 'error');
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="admin-header flex-between flex-wrap gap-4">
        <div>
          <h1>Inventory Management</h1>
          <p>Track stocks for pizza customizer options and get alerts for low items.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} /> Add Inventory Item
        </button>
      </div>

      {/* Category Tabs */}
      <div className="category-filter" style={{ justifyContent: 'flex-start' }}>
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab}
            className={`category-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching inventory data..." />
      ) : inventory.length === 0 ? (
        <div className="card text-center" style={{ padding: 'var(--space-12)' }}>
          <p className="text-muted">No inventory items found.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Quantity / Stock</th>
                  <th>Min Threshold</th>
                  <th>Price Addition</th>
                  <th>Stock Alerts</th>
                  <th>Stock Mutator</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => {
                  const isLow = item.quantity <= item.threshold;
                  return (
                    <tr key={item._id} style={{ background: isLow ? 'rgba(255, 71, 87, 0.02)' : 'none' }}>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td>{item.category}</td>
                      <td style={{ fontWeight: 700 }}>{item.quantity} {item.unit}</td>
                      <td>{item.threshold} {item.unit}</td>
                      <td style={{ color: 'var(--color-primary)' }}>{formatPrice(item.price)}</td>
                      <td>
                        {isLow ? (
                          <Badge variant="danger">
                            <ShieldAlert size={12} style={{ marginRight: '4px' }} /> Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="success">OK</Badge>
                        )}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            className="quantity-btn btn-sm"
                            onClick={() => handleStockAdjust(item._id, item.quantity, -5)}
                            aria-label="Deduct 5 stock"
                          >
                            -5
                          </button>
                          <button
                            className="quantity-btn btn-sm"
                            onClick={() => handleStockAdjust(item._id, item.quantity, 5)}
                            aria-label="Add 5 stock"
                          >
                            +5
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            className="btn-icon"
                            onClick={() => { setEditingItem(item); setIsEditOpen(true); }}
                            aria-label="Edit item"
                          >
                            <Edit2 size={16} color="var(--color-text-secondary)" />
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => handleDelete(item._id)}
                            aria-label="Delete item"
                            style={{ color: 'var(--color-danger)' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Inventory Item">
        <form onSubmit={handleAddSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="add-name">Item Name</label>
            <input
              type="text"
              id="add-name"
              className="form-input"
              required
              value={newItem.name}
              onChange={e => setNewItem({ ...newItem, name: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="add-cat">Category</label>
              <select
                id="add-cat"
                className="form-input"
                value={newItem.category}
                onChange={e => setNewItem({ ...newItem, category: e.target.value })}
              >
                {CATEGORY_TABS.slice(1).map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="add-price">Price Addition (INR)</label>
              <input
                type="number"
                id="add-price"
                className="form-input"
                min="0"
                value={newItem.price}
                onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="add-qty">Initial Quantity</label>
              <input
                type="number"
                id="add-qty"
                className="form-input"
                min="0"
                value={newItem.quantity}
                onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="add-thresh">Low stock Threshold</label>
              <input
                type="number"
                id="add-thresh"
                className="form-input"
                min="1"
                value={newItem.threshold}
                onChange={e => setNewItem({ ...newItem, threshold: Number(e.target.value) })}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full btn-lg mt-4">
            Add to Catalog
          </button>
        </form>
      </Modal>

      {/* Edit Modal */}
      {editingItem && (
        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit: ${editingItem.name}`}>
          <form onSubmit={handleEditSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-name">Item Name</label>
              <input
                type="text"
                id="edit-name"
                className="form-input"
                required
                value={editingItem.name}
                onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-cat">Category</label>
                <select
                  id="edit-cat"
                  className="form-input"
                  value={editingItem.category}
                  onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                >
                  {CATEGORY_TABS.slice(1).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-price">Price Addition (INR)</label>
                <input
                  type="number"
                  id="edit-price"
                  className="form-input"
                  min="0"
                  value={editingItem.price}
                  onChange={e => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-qty">Current Quantity</label>
                <input
                  type="number"
                  id="edit-qty"
                  className="form-input"
                  min="0"
                  value={editingItem.quantity}
                  onChange={e => setEditingItem({ ...editingItem, quantity: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-thresh">Low stock Threshold</label>
                <input
                  type="number"
                  id="edit-thresh"
                  className="form-input"
                  min="1"
                  value={editingItem.threshold}
                  onChange={e => setEditingItem({ ...editingItem, threshold: Number(e.target.value) })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg mt-4">
              Save Changes
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
