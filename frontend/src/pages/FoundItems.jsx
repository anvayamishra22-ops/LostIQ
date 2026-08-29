import React, { useState, useEffect } from 'react';
import { itemAPI } from '../services/api';
import ItemCard from '../components/ItemCard';

const CATEGORIES = ['All', 'Electronics', 'Documents', 'Keys & Cards', 'Bags & Clothing', 'Others'];
const LOCATIONS = ['All', 'Academic Block A', 'Academic Block B', 'Central Library', 'Main Canteen', 'Boys Hostel', 'Girls Hostel', 'College Playground', 'Seminar Hall'];

const FoundItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('All');
  const [status, setStatus] = useState('All'); // All, active, recovered

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = { type: 'found' };
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (location !== 'All') params.location = location;
      if (status !== 'All') params.status = status;

      const response = await itemAPI.getAll(params);
      setItems(response.data);
    } catch (err) {
      setError('Failed to fetch found items.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [category, location, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleReset = () => {
    setSearch('');
    setCategory('All');
    setLocation('All');
    setStatus('All');
    setLoading(true);
    itemAPI.getAll({ type: 'found' }).then(response => {
      setItems(response.data);
      setLoading(false);
    }).catch(err => {
      setError('Failed to fetch found items.');
      setLoading(false);
    });
  };

  return (
    <div>
      <h2 className="section-title">Reported Found Items</h2>
      <p className="subtitle">Browse items found on college campus. Help return them to their rightful owners!</p>

      {/* Filter and Search Bar */}
      <form className="filters-bar" onSubmit={handleSearchSubmit}>
        <div className="filter-item" style={{ flex: 2 }}>
          <label htmlFor="search">Search Item Name</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              id="search"
              type="text"
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. keycard, water bottle, calculator"
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </div>
        </div>

        <div className="filter-item">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="location">Location</label>
          <select
            id="location"
            className="form-control"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            {LOCATIONS.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            className="form-control"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="All">All status</option>
            <option value="active">Unclaimed</option>
            <option value="recovered">Returned</option>
          </select>
        </div>

        <button type="button" onClick={handleReset} className="btn btn-secondary">
          Reset
        </button>
      </form>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      ) : (
        <>
          {items.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>
              No found items match your search or filter settings.
            </div>
          ) : (
            <div className="grid">
              {items.map(item => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FoundItems;
