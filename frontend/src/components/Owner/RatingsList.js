import { useState, useEffect } from 'react';
import api from '../../api';
import { FaSearch, FaUser, FaStar } from 'react-icons/fa';
import './RatingsList.css';

const RatingsList = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadRatings() {
      try {
        const storesRes = await api.get('/api/owner/stores');
        if (!storesRes.data.length) {
          setRatings([]);
        } else {
          const id = storesRes.data[0].id;
          const ratingsRes = await api.get(`/api/owner/stores/${id}/ratings`);
          setRatings(ratingsRes.data);
        }
      } catch (err) {
        console.error('RatingsList error:', err);
        setError('Failed to fetch ratings');
      } finally {
        setLoading(false);
      }
    }
    loadRatings();
  }, []);

  const filtered = ratings.filter(r =>
    r.user.name.toLowerCase().includes(search.toLowerCase()) ||
    r.user.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading">Loading ratings...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="ratings-list">
      <h2 className="ratings-heading">Store Ratings</h2>

      <div className="search-box">
        <FaSearch className="search-icon" />
        <input
          className="search-input"
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="no-ratings">
          <FaStar size={48} className="no-ratings-icon" />
          <p>No ratings found</p>
        </div>
      ) : (
        <div className="ratings-grid">
          {filtered.map(r => (
            <div key={r.id} className="rating-card">
              <div className="user-info">
                <div className="user-icon">
                  <FaUser />
                </div>
                <div className="user-details">
                  <h4 className="user-name">{r.user.name}</h4>
                  <p className="user-email">{r.user.email}</p>
                </div>
              </div>
              <div className="rating-info">
                <div className="rating-value">
                  <FaStar className="star-icon" />
                  <span>{r.rating}</span>
                </div>
                <p className="rating-date">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RatingsList;
