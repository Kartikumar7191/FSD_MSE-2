import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import GrievanceCard from '../components/GrievanceCard';
import api from '../api';

const CATEGORIES = ['Academic', 'Hostel', 'Transport', 'Other'];

export default function Dashboard({ student, onLogout }) {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitMsg, setSubmitMsg] = useState({ text: '', type: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', category: 'Academic',
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch all grievances
  const fetchGrievances = useCallback(async () => {
    setLoading(true);
    setIsSearchMode(false);
    try {
      const res = await api.get('/grievances');
      setGrievances(res.data.grievances);
    } catch {
      setGrievances([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGrievances(); }, [fetchGrievances]);

  // Submit new grievance
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMsg({ text: '', type: '' });

    try {
      const res = await api.post('/grievances', form);
      setGrievances((prev) => [res.data.grievance, ...prev]);
      setForm({ title: '', description: '', category: 'Academic' });
      setSubmitMsg({ text: 'Grievance submitted successfully!', type: 'success' });
      setTimeout(() => setSubmitMsg({ text: '', type: '' }), 3000);
    } catch (err) {
      setSubmitMsg({
        text: err.response?.data?.message || 'Submission failed.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Search
  const handleSearch = async () => {
    if (!searchQuery.trim()) { fetchGrievances(); return; }
    setSearching(true);
    setIsSearchMode(true);
    try {
      const res = await api.get(`/grievances/search?title=${encodeURIComponent(searchQuery)}`);
      setGrievances(res.data.grievances);
    } catch {
      setGrievances([]);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    fetchGrievances();
  };

  // Update / Delete callbacks
  const handleUpdated = (updated) => {
    setGrievances((prev) => prev.map((g) => (g._id === updated._id ? updated : g)));
  };

  const handleDeleted = (id) => {
    setGrievances((prev) => prev.filter((g) => g._id !== id));
  };

  // Stats
  const total = grievances.length;
  const pending = grievances.filter((g) => g.status === 'Pending').length;
  const resolved = grievances.filter((g) => g.status === 'Resolved').length;

  return (
    <>
      <Navbar student={student} onLogout={onLogout} />

      <div className="container dashboard">

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total grievances</div>
            <div className="stat-value stat-blue">{total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending</div>
            <div className="stat-value stat-amber">{pending}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Resolved</div>
            <div className="stat-value stat-green">{resolved}</div>
          </div>
        </div>

        {/* Submit Form */}
        <div className="card submit-form">
          <div className="section-title">Submit a new grievance</div>

          {submitMsg.text && (
            <div className={`alert alert-${submitMsg.type}`}>{submitMsg.text}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="Brief summary of your issue"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                minLength={5}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Describe your grievance in detail…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                minLength={10}
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 1 }}>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={submitting}
                  style={{ width: '100%' }}
                >
                  {submitting ? 'Submitting…' : 'Submit grievance'}
                </button>
              </div>
            </div>
          </form>
        </div>

        <hr className="section-divider" />

        {/* Search */}
        <div className="section-title">My grievances</div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by title…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn btn-primary" onClick={handleSearch} disabled={searching}>
            {searching ? 'Searching…' : 'Search'}
          </button>
          {isSearchMode && (
            <button className="btn btn-outline" onClick={clearSearch}>
              Clear
            </button>
          )}
        </div>

        {/* Grievance List */}
        {loading ? (
          <div className="loading-wrap">Loading grievances…</div>
        ) : grievances.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>{isSearchMode ? 'No results found' : 'No grievances yet'}</h3>
            <p>{isSearchMode ? 'Try a different search term.' : 'Submit your first grievance above.'}</p>
          </div>
        ) : (
          <div className="grievance-list">
            {grievances.map((g) => (
              <GrievanceCard
                key={g._id}
                grievance={g}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        )}

      </div>
    </>
  );
}
