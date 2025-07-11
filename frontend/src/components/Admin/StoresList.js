import { useState, useEffect } from 'react';
import api from '../../api';
import { FaSearch, FaStore, FaStar } from 'react-icons/fa';
import './StoresList.css';

const StoresList = () => {
  const [stores, setStores] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStores() {
      try {
        const res = await api.get('/api/admin/stores');
        setStores(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error('Failed to load stores:', err);
        setError('Failed to load stores');
      } finally {
        setLoading(false);
      }
    }
    fetchStores();
  }, []);

  useEffect(() => {
    setFiltered(
      stores.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.address.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, stores]);

  if (loading) return <div className="loading">Loading stores...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="stores-list">
      <h2 className="list-title">All Stores (Admin)</h2>
      <div className="search-box">
        <FaSearch className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search stores..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {filtered.length === 0 ? (
        <div className="no-data">No stores found</div>
      ) : (
        <div className="store-grid">
          {filtered.map(store => (
            <div key={store.id} className="store-card">
              <div className="store-header">
                <FaStore className="store-icon" />
                <h3 className="store-name">{store.name}</h3>
              </div>
              <p className="store-info">{store.address}</p>
              <p className="store-info">{store.email}</p>
              <p className="store-info">Owner: {store.ownerName}</p>
              <p className="store-rating">
                <FaStar className="star-icon" /> {store.avgRating || 'N/A'} ({store.ratingCount})
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoresList;