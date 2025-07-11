import { useState, useEffect } from 'react';
import api from '../../api';
import { FaStar } from 'react-icons/fa';
import './MyRatings.css';

const MyRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadRatings() {
      try {
        const res = await api.get('/api/user/ratings');
        setRatings(res.data);
      } catch (err) {
        console.error('MyRatings fetch error:', err);
        setError('Failed to load ratings');
      } finally {
        setLoading(false);
      }
    }
    loadRatings();
  }, []);

  if (loading) return <div className="ratings-loading">Loading ratings...</div>;
  if (error) return <div className="ratings-error">{error}</div>;
  if (!ratings.length) return (
    <div className="no-ratings">
      <p>No ratings submitted yet.</p>
    </div>
  );

  return (
    <div className="my-ratings">
      <h2 className="my-ratings-title">My Ratings</h2>
      <div className="rating-list">
        {ratings.map(r => (
          <div key={r.storeId + r.createdAt} className="rating-card">
            <div className="rating-store">{r.storeName}</div>
            <div className="rating-details">
              <div className="rating-stars">
                <FaStar />
                <span>{r.rating}</span>
              </div>
              <div className="rating-date">
                {new Date(r.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyRatings;