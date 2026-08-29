import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { itemAPI, claimAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Claim modal state
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState('');
  const [existingClaims, setExistingClaims] = useState([]);

  const fetchItemAndClaims = async () => {
    try {
      const itemRes = await itemAPI.getById(id);
      setItem(itemRes.data);

      if (user) {
        // Fetch user's claims to check if they already claimed this item
        const claimRes = await claimAPI.getMyClaims();
        const claimsOnThisItem = claimRes.data.filter(c => c.item?._id === id);
        setExistingClaims(claimsOnThisItem);
      }
    } catch (err) {
      setError('Failed to fetch item details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemAndClaims();
  }, [id, user]);

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!claimMessage.trim()) {
      setClaimError('Please provide some identifying details.');
      return;
    }

    setClaimLoading(true);
    setClaimError('');
    setClaimSuccess('');

    try {
      await claimAPI.create({ item: id, message: claimMessage });
      setClaimSuccess('Claim submitted successfully!');
      setClaimMessage('');
      
      // Re-fetch to update state
      await fetchItemAndClaims();

      setTimeout(() => {
        setShowClaimModal(false);
        setClaimSuccess('');
      }, 2000);
    } catch (err) {
      setClaimError(err.response?.data?.message || 'Failed to submit claim.');
      console.error(err);
    } finally {
      setClaimLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}${path}`;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="alert alert-danger" style={{ marginTop: '2rem' }}>
        {error || 'Item not found.'}
      </div>
    );
  }

  const isOwner = user && item.user?._id === user._id;
  const isClaimed = existingClaims.length > 0;
  const claimStatus = isClaimed ? existingClaims[0].status : null;

  return (
    <div>
      <Link to={item.type === 'lost' ? '/lost-items' : '/found-items'} className="btn btn-secondary" style={{ marginBottom: '1.5rem' }}>
        ← Back to Listings
      </Link>

      <div className="details-grid">
        {/* Left Side - Image */}
        <div className="details-image-box">
          {item.image ? (
            <img src={getImageUrl(item.image)} alt={item.itemName} className="details-image" />
          ) : (
            <div className="card-placeholder" style={{ fontSize: '1.25rem' }}>No Image Available</div>
          )}
        </div>

        {/* Right Side - Information */}
        <div className="details-info">
          <div className="details-header">
            <span className={`status-badge status-${item.status}`} style={{ marginBottom: '0.5rem' }}>
              {item.status === 'active' ? (item.type === 'lost' ? 'STILL MISSING' : 'UNCLAIMED') : 'RESOLVED / RECOVERED'}
            </span>
            <h1 className="details-title">{item.itemName}</h1>
            <p style={{ display: 'inline-flex', gap: '0.5rem' }}>
              <span className={`badge badge-${item.type}`} style={{ position: 'relative', top: 0, left: 0 }}>
                {item.type}
              </span>
            </p>
          </div>

          <div className="details-desc-box">
            <h3 className="details-desc-title">Description</h3>
            <p className="details-desc">{item.description}</p>
          </div>

          <div className="details-meta-list">
            <div className="details-meta-item">
              <span className="meta-label">🏷️ Category:</span>
              <span className="meta-value">{item.category}</span>
            </div>
            <div className="details-meta-item">
              <span className="meta-label">📍 Location:</span>
              <span className="meta-value">{item.location}</span>
            </div>
            <div className="details-meta-item">
              <span className="meta-label">📅 Date:</span>
              <span className="meta-value">{formatDate(item.date)}</span>
            </div>
            <div className="details-meta-item">
              <span className="meta-label">👤 Reported By:</span>
              <span className="meta-value">{item.user?.name} ({item.user?.email})</span>
            </div>
          </div>

          {/* Action section based on user auth status */}
          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            {item.status === 'recovered' ? (
              <div className="alert alert-success" style={{ marginBottom: 0 }}>
                🎉 This item has been returned and marked as recovered!
              </div>
            ) : item.type === 'lost' ? (
              <div className="alert alert-danger" style={{ marginBottom: 0 }}>
                📢 If you find this item, please contact the owner at <strong>{item.user?.email}</strong>.
              </div>
            ) : !user ? (
              <div className="alert alert-danger" style={{ marginBottom: 0 }}>
                🔒 You must <Link to="/login" style={{ textDecoration: 'underline', fontWeight: 600 }}>Login</Link> to claim this item.
              </div>
            ) : isOwner ? (
              <div className="alert alert-success" style={{ marginBottom: 0 }}>
                ℹ️ You reported this found item. You can manage claims on your <strong>My Reports</strong> page.
              </div>
            ) : isClaimed ? (
              <div className="card" style={{ padding: '1rem', border: '1px solid var(--border)' }}>
                <p style={{ fontWeight: 600 }}>Claim Status: <span className={`status-badge status-${claimStatus === 'approved' ? 'recovered' : claimStatus === 'rejected' ? 'danger' : 'active'}`}>{claimStatus.toUpperCase()}</span></p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                  {claimStatus === 'pending' && "Your claim is currently pending review by the finder."}
                  {claimStatus === 'approved' && "Your claim was approved! You can coordinate with the finder."}
                  {claimStatus === 'rejected' && "Your claim was declined. Contact the finder if you think this is a mistake."}
                </p>
              </div>
            ) : (
              <button onClick={() => setShowClaimModal(true)} className="btn btn-primary" style={{ width: '100%' }}>
                ✋ Claim Item
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Claim Submission Modal */}
      {showClaimModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-header">Submit Claim Request</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '1.25rem' }}>
              Explain why this item belongs to you. Add identifying details (e.g. locks, unique marks, wallpaper, contents) that only the owner would know.
            </p>

            {claimError && <div className="alert alert-danger">{claimError}</div>}
            {claimSuccess && <div className="alert alert-success">{claimSuccess}</div>}

            <form onSubmit={handleClaimSubmit}>
              <div className="form-group">
                <label htmlFor="claim-msg">Identifying Details / Message</label>
                <textarea
                  id="claim-msg"
                  className="form-control"
                  value={claimMessage}
                  onChange={(e) => setClaimMessage(e.target.value)}
                  placeholder="e.g. The laptop has a cracked screen in the top-left corner, and the desktop wallpaper is a picture of a mountain."
                  rows={4}
                  required
                />
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="btn btn-secondary"
                  disabled={claimLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={claimLoading}
                >
                  {claimLoading ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetails;
