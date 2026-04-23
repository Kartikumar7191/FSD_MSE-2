import React, { useState } from 'react';
import api from '../api';

const CATEGORIES = ['Academic', 'Hostel', 'Transport', 'Other'];

function catBadgeClass(cat) {
  return 'badge badge-' + (cat || 'other').toLowerCase();
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default function GrievanceCard({ grievance, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: grievance.title,
    description: grievance.description,
    category: grievance.category,
    status: grievance.status,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    if (!form.title || !form.description) {
      setError('Title and description are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.put(`/grievances/${grievance._id}`, form);
      onUpdated(res.data.grievance);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this grievance?')) return;
    try {
      await api.delete(`/grievances/${grievance._id}`);
      onDeleted(grievance._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <div className="grievance-card">
      <div className="grievance-card-top">
        <div style={{ flex: 1 }}>
          <h3>{grievance.title}</h3>
          <p className="grievance-desc">{grievance.description}</p>
          <div className="grievance-card-meta">
            <span className={catBadgeClass(grievance.category)}>{grievance.category}</span>
            <span className={`badge ${grievance.status === 'Resolved' ? 'badge-resolved' : 'badge-pending'}`}>
              {grievance.status}
            </span>
            <span className="badge badge-date">{formatDate(grievance.date)}</span>
          </div>
        </div>

        <div className="grievance-actions">
          <button
            className="btn btn-sm btn-edit"
            onClick={() => { setEditing(!editing); setError(''); }}
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button className="btn btn-sm btn-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      {editing && (
        <div className="edit-form">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label>Title</label>
            <input name="title" value={form.title} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option>Pending</option>
                <option>Resolved</option>
              </select>
            </div>
          </div>

          <div className="edit-form-actions">
            <button className="btn btn-primary btn-sm" onClick={handleUpdate} disabled={loading}>
              {loading ? 'Saving…' : 'Save changes'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
