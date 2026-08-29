import React, { useState, useEffect } from 'react';
import { claimAPI } from '../services/api';
import { Link } from 'react-router-dom';

const Claims = () => {
  const [activeTab, setActiveTab] = useState('received'); // received, sent
  const [sentClaims, setSentClaims] = useState([]);
  const [receivedClaims, setReceivedClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchClaims = async () => {
    try {
      const sentRes = await claimAPI.getMyClaims();
      setSentClaims(sentRes.data);

      const receivedRes = await claimAPI.getReceivedClaims();
      setReceivedClaims(receivedRes.data);
    } catch (err) {
      setError('Failed to retrieve claims.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleUpdateStatus = async (claimId, status) => {
    const actionWord = status === 'approved' ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${actionWord} this claim?`)) {
      return;
    }

    try {
      await claimAPI.updateStatus(claimId, status);
      setSuccess(`Claim request successfully ${status}!`);
      fetchClaims();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to update claim status.');
      console.error(err);
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
      <h2 className="section-title">Claim Management</h2>
      <p className="subtitle">Verify and manage claims for found items.</p>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="tabs">
        <span
          className={`tab ${activeTab === 'received' ? 'active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          📥 Claims Received ({receivedClaims.length})
        </span>
        <span
          className={`tab ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          📤 Claims I Filed ({sentClaims.length})
        </span>
      </div>

      {activeTab === 'received' ? (
        // Claims Received Layout
        receivedClaims.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>
            No claims received on your reported found items yet.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Claimant</th>
                  <th>Claimant Message</th>
                  <th>Filed Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {receivedClaims.map((claim) => (
                  <tr key={claim._id}>
                    <td>
                      <Link to={`/items/${claim.item?._id}`} style={{ fontWeight: 600, textDecoration: 'underline' }}>
                        {claim.item?.itemName}
                      </Link>
                    </td>
                    <td>
                      <div><strong>{claim.claimant?.name}</strong></div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{claim.claimant?.email}</div>
                    </td>
                    <td style={{ maxWidth: '300px', fontSize: '0.9rem' }}>{claim.message}</td>
                    <td>{formatDate(claim.createdAt)}</td>
                    <td>
                      <span className={`status-badge status-${claim.status}`}>
                        {claim.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {claim.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleUpdateStatus(claim._id, 'approved')}
                            className="btn btn-success"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(claim._id, 'rejected')}
                            className="btn btn-danger"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
                          Resolved
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        // Claims Filed Layout
        sentClaims.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>
            You have not submitted claims on any found items yet.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Reported By</th>
                  <th>My Claim Message</th>
                  <th>Date Filed</th>
                  <th>Claim Status</th>
                </tr>
              </thead>
              <tbody>
                {sentClaims.map((claim) => (
                  <tr key={claim._id}>
                    <td>
                      <Link to={`/items/${claim.item?._id}`} style={{ fontWeight: 600, textDecoration: 'underline' }}>
                        {claim.item?.itemName || 'Deleted Item'}
                      </Link>
                    </td>
                    <td>
                      {claim.item?.user ? (
                        <>
                          <div><strong>{claim.item.user.name}</strong></div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{claim.item.user.email}</div>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-light)' }}>Unknown</span>
                      )}
                    </td>
                    <td style={{ maxWidth: '300px', fontSize: '0.9rem' }}>{claim.message}</td>
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

export default Claims;
