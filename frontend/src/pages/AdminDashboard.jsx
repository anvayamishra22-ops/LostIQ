import React, { useState, useEffect } from 'react';
import { adminAPI, itemAPI } from '../services/api';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users'); // users, items, claims
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await adminAPI.getUsers();
        setUsers(res.data);
      } else if (activeTab === 'items') {
        const res = await adminAPI.getItems();
        setItems(res.data);
      } else if (activeTab === 'claims') {
        const res = await adminAPI.getClaims();
        setClaims(res.data);
      }
    } catch (err) {
      setError('Failed to fetch admin data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This will remove all their reported items and claim records.')) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      setSuccess('User and associated data deleted!');
      fetchAdminData();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
      console.error(err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item report?')) {
      return;
    }

    try {
      await itemAPI.delete(itemId);
      setSuccess('Item report deleted successfully!');
      fetchAdminData();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to delete item report.');
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div>
      <h2 className="section-title">Admin Control Dashboard</h2>
      <p className="subtitle">System-wide monitoring of users, items, and claim requests.</p>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="tabs">
        <span
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Manage Users
        </span>
        <span
          className={`tab ${activeTab === 'items' ? 'active' : ''}`}
          onClick={() => setActiveTab('items')}
        >
          📦 Manage Items
        </span>
        <span
          className={`tab ${activeTab === 'claims' ? 'active' : ''}`}
          onClick={() => setActiveTab('claims')}
        >
          📋 Manage Claims
        </span>
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      ) : activeTab === 'users' ? (
        // Users Table View
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`status-badge ${u.role === 'admin' ? 'status-recovered' : 'status-active'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="btn btn-danger"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                    >
                      Delete User
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'items' ? (
        // Items Table View
        items.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>
            No item reports found in database.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Type</th>
                  <th>Reported By</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item._id}>
                    <td>
                      <Link to={`/items/${item._id}`} style={{ fontWeight: 600, textDecoration: 'underline' }}>
                        {item.itemName}
                      </Link>
                    </td>
                    <td>
                      <span className={`badge badge-${item.type}`} style={{ position: 'static' }}>
                        {item.type}
                      </span>
                    </td>
                    <td>
                      <div>{item.user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{item.user?.email}</div>
                    </td>
                    <td>{formatDate(item.date)}</td>
                    <td>
                      <span className={`status-badge status-${item.status}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="btn btn-danger"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                      >
                        Delete Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        // Claims Table View
        claims.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>
            No claims recorded in database.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Item Cereal</th>
                  <th>Claimant</th>
                  <th>Message Submitted</th>
                  <th>Date Submitted</th>
                  <th>Claim Status</th>
                </tr>
              </thead>
              <tbody>
                {claims.map(claim => (
                  <tr key={claim._id}>
                    <td>
                      <Link to={`/items/${claim.item?._id}`} style={{ fontWeight: 600, textDecoration: 'underline' }}>
                        {claim.item?.itemName || 'Deleted Item'}
                      </Link>
                    </td>
                    <td>
                      <div><strong>{claim.claimant?.name}</strong></div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{claim.claimant?.email}</div>
                    </td>
                    <td style={{ maxWidth: '300px', fontSize: '0.85rem' }}>{claim.message}</td>
                    <td>{formatDate(claim.createdAt)}</td>
                    <td>
                      <span className={`status-badge status-${claim.status}`}>
                        {claim.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default AdminDashboard;
