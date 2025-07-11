import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { FaStore } from 'react-icons/fa';
import './StoreList.css';

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStores() {
      try {
        const res = await api.get('/api/owner/stores');
        setStores(res.data);
      } catch (err) {
        console.error('StoreList fetch error:', err);
        setError('Failed to load your stores');
      } finally {
        setLoading(false);
      }
    }
    loadStores();
  }, []);

  if (loading) return <div className="loading">Loading your stores...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!stores.length) return (
    <div className="no-stores">
      <p>No stores found</p>
    </div>
  );

  return (
    <div className="owner-store-list">
      <h2 className="store-list-title">Your Stores</h2>
      <div className="store-grid">
        {stores.map(s => (
          <div key={s.id} className="store-card">
            <div className="store-header">
              <FaStore className="store-icon" />
              <h3 className="store-name">{s.name}</h3>
            </div>
            <div className="store-details">
              <p className="store-address">{s.address}</p>
              <p className="store-email">{s.email}</p>
            </div>
            <Link to={`/owner/stores/${s.id}/ratings`} className="view-ratings-btn">
              View Ratings
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreList;
