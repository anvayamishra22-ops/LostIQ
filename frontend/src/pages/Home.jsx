import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemAPI } from '../services/api';
import ItemCard from '../components/ItemCard';

const Home = () => {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecentItems = async () => {
      try {
        // Fetch all active items, then filter and take recent 3
        const response = await itemAPI.getAll({ status: 'active' });
        const items = response.data;
        
        const lost = items.filter(item => item.type === 'lost').slice(0, 3);
        const found = items.filter(item => item.type === 'found').slice(0, 3);
        
        setLostItems(lost);
        setFoundItems(found);
      } catch (err) {
        setError('Could not retrieve recent items. Make sure the server is online.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentItems();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">LOSTIQ</h1>
        <p className="hero-subtitle">
          The smart campus Lost & Found directory. Report missing belongings, browse recovered items, and easily file claims to recover your items.
        </p>
        <div className="hero-buttons">
          <Link to="/report-lost" className="btn btn-danger">
            🚨 Report Lost Item
          </Link>
          <Link to="/report-found" className="btn btn-primary">
            🔍 Report Found Item
          </Link>
        </div>
      </section>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      ) : (
        <>
          {/* Recent Lost Items */}
          <section style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Recent Lost Items</h2>
              <Link to="/lost-items" className="btn btn-secondary">View All Lost Items</Link>
            </div>
            {lostItems.length === 0 ? (
              <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                No active lost item reports on campus.
              </div>
            ) : (
              <div className="grid">
                {lostItems.map(item => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>
            )}
          </section>

          {/* Recent Found Items */}
          <section style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Recent Found Items</h2>
              <Link to="/found-items" className="btn btn-secondary">View All Found Items</Link>
            </div>
            {foundItems.length === 0 ? (
              <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                No active found item reports on campus.
              </div>
            ) : (
              <div className="grid">
                {foundItems.map(item => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
