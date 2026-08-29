import React from 'react';
import { Link } from 'react-router-dom';

const ItemCard = ({ item }) => {
  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    // Resolve base url dynamically from VITE_API_URL or default to port 5000
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}${path}`;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="card">
      <div className="card-img-container">
        {item.image ? (
          <img src={getImageUrl(item.image)} alt={item.itemName} className="card-img" />
        ) : (
          <div className="card-placeholder">No Image Uploaded</div>
        )}
        <span className={`badge badge-${item.type}`}>
          {item.type}
        </span>
      </div>
      <div className="card-body">
        <h3 className="card-title">{item.itemName}</h3>
        <p className="card-desc">{item.description}</p>
        
        <div style={{ marginBottom: '0.75rem' }}>
          <span className={`status-badge status-${item.status}`}>
            {item.status === 'active' ? (item.type === 'lost' ? 'Still Lost' : 'Unclaimed') : 'Returned / Recovered'}
          </span>
        </div>

        <div className="card-meta">
          <span>📍 <strong>Location:</strong> {item.location}</span>
          <span>📅 <strong>Date:</strong> {formatDate(item.date)}</span>
          <span>🏷️ <strong>Category:</strong> {item.category}</span>
        </div>
        
        <Link to={`/items/${item._id}`} className="btn btn-secondary" style={{ marginTop: '1rem', width: '100%' }}>
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ItemCard;
