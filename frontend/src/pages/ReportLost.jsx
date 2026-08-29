import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const CATEGORIES = ['Electronics', 'Documents', 'Keys & Cards', 'Bags & Clothing', 'Others'];
const LOCATIONS = ['Academic Block A', 'Academic Block B', 'Central Library', 'Main Canteen', 'Boys Hostel', 'Girls Hostel', 'College Playground', 'Seminar Hall'];

const ReportLost = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [date, setDate] = useState('');
  const [imageFile, setImageFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!itemName || !category || !description || !location || !date) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('itemName', itemName);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('location', location);
      formData.append('date', date);
      formData.append('type', 'lost');
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await itemAPI.create(formData);
      setSuccess('Lost item reported successfully!');
      
      // Clear form
      setItemName('');
      setDescription('');
      setDate('');
      setImageFile(null);
      
      // Reset file input in DOM
      document.getElementById('image-upload').value = '';

      setTimeout(() => {
        navigate('/lost-items');
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while saving item.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container" style={{ maxWidth: '600px' }}>
      <h2 className="section-title" style={{ textAlign: 'center' }}>🚨 Report Lost Item</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '1.5rem' }}>
        Fill out this form to broadcast a lost item to the campus community
      </p>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-group">
          <label htmlFor="itemName">Item Name *</label>
          <input
            id="itemName"
            type="text"
            className="form-control"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="e.g. Blue Dell Laptop, Leather Wallet"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Detailed Description *</label>
          <textarea
            id="description"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe unique characteristics, color, brand, condition, tags, etc."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Estimated Location Lost *</label>
          <select
            id="location"
            className="form-control"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          >
            {LOCATIONS.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Date Lost *</label>
          <input
            id="date"
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="image-upload">Upload Item Photo (Optional, max 1 image)</label>
          <input
            id="image-upload"
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handleFileChange}
            style={{ padding: '0.4rem' }}
          />
        </div>

        <button type="submit" className="btn btn-danger" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
          {loading ? 'Submitting Report...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

export default ReportLost;
