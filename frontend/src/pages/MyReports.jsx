import React, { useState, useEffect } from 'react';
import { itemAPI } from '../services/api';

const CATEGORIES = ['Electronics', 'Documents', 'Keys & Cards', 'Bags & Clothing', 'Others'];
const LOCATIONS = ['Academic Block A', 'Academic Block B', 'Central Library', 'Main Canteen', 'Boys Hostel', 'Girls Hostel', 'College Playground', 'Seminar Hall'];

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editing state
  const [editItem, setEditItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const fetchReports = async () => {
    try {
      const response = await itemAPI.getMyReports();
      setReports(response.data);
    } catch (err) {
      setError('Failed to fetch your reports.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleMarkReturned = async (itemId) => {
    try {
      await itemAPI.recover(itemId);
      setSuccess('Item marked as returned!');
      fetchReports();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to update status.');
      console.error(err);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this report? This cannot be undone.')) {
      return;
    }

    try {
      await itemAPI.delete(itemId);
      setSuccess('Report deleted successfully!');
      fetchReports();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to delete report.');
      console.error(err);
    }
  };

  const handleOpenEdit = (item) => {
    setEditItem(item);
    setEditName(item.itemName);
    setEditCategory(item.category);
    setEditDescription(item.description);
    setEditLocation(item.location);
    // Format date string to YYYY-MM-DD
    const formattedDate = new Date(item.date).toISOString().split('T')[0];
    setEditDate(formattedDate);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('itemName', editName);
      formData.append('category', editCategory);
      formData.append('description', editDescription);
      formData.append('location', editLocation);
      formData.append('date', editDate);
      if (editImage) {
        formData.append('image', editImage);
      }

      await itemAPI.update(editItem._id, formData);
      setSuccess('Report updated successfully!');
      setEditItem(null);
      setEditImage(null);
      fetchReports();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to update report.');
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="section-title">My Reported Items</h2>
      <p className="subtitle">Manage items you reported lost or found on campus.</p>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {reports.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>
          You have not reported any items yet.
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Type</th>
                <th>Category</th>
                <th>Location</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((item) => (
                <tr key={item._id}>
                  <td style={{ fontWeight: 600 }}>{item.itemName}</td>
                  <td>
                    <span className={`badge badge-${item.type}`} style={{ position: 'static' }}>
                      {item.type}
                    </span>
                  </td>
                  <td>{item.category}</td>
                  <td>{item.location}</td>
                  <td>{formatDate(item.date)}</td>
                  <td>
                    <span className={`status-badge status-${item.status}`}>
                      {item.status === 'active' ? (item.type === 'lost' ? 'Lost' : 'Unclaimed') : 'Recovered'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleOpenEdit(item)} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>
                        ✏️ Edit
                      </button>
                      
                      {item.type === 'found' && item.status === 'active' && (
                        <button onClick={() => handleMarkReturned(item._id)} className="btn btn-success" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>
                          ✔️ Return
                        </button>
                      )}

                      <button onClick={() => handleDelete(item._id)} className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h3 className="modal-header">Edit Report: {editItem.itemName}</h3>
            
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="edit-name">Item Name</label>
                <input
                  id="edit-name"
                  type="text"
                  className="form-control"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-category">Category</label>
                <select
                  id="edit-category"
                  className="form-control"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  required
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-desc">Description</label>
                <textarea
                  id="edit-desc"
                  className="form-control"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-loc">Location</label>
                <select
                  id="edit-loc"
                  className="form-control"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  required
                >
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-date">Date</label>
                <input
                  id="edit-date"
                  type="date"
                  className="form-control"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-image">Replace Photo (Optional)</label>
                <input
                  id="edit-image"
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => setEditImage(e.target.files[0])}
                  style={{ padding: '0.4rem' }}
                />
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="btn btn-secondary"
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={editLoading}
                >
                  {editLoading ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReports;
