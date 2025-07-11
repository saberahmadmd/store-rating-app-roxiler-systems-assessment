import { useState, useEffect } from 'react';
import api from '../../api';
import RatingStars from '../Common/RatingStars';
import './StoreList.css';

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [storesRes, ratingsRes] = await Promise.all([
          api.get('/api/user/stores'),
          api.get('/api/user/ratings')
        ]);
        setStores(storesRes.data);
        const map = {};
        ratingsRes.data.forEach(r => { map[r.storeId] = r.rating; });
        setUserRatings(map);
      } catch (err) {
        console.error('Fetch stores/ratings error:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRate = async (storeId, rating) => {
    try {
      await api.post('/api/user/rating', { storeId, rating });
      setUserRatings(prev => ({ ...prev, [storeId]: rating }));
      setStores(prev =>
        prev.map(s => {
          if (s.id === storeId) {
            const origCount = s.ratingCount || 0;
            const isNew = userRatings[storeId] == null;
            const newCount = isNew ? origCount + 1 : origCount;
            const sum = s.avgRating * origCount - (userRatings[storeId] || 0) + rating;
            const newAvg = parseFloat((sum / newCount).toFixed(1));
            return { ...s, avgRating: newAvg, ratingCount: newCount };
          }
          return s;
        })
      );
    } catch (err) {
      console.error('Rating error:', err);
      setError('Failed to submit rating');
    }
  };

  if (loading) return <div className="store-list-loading">Loading stores...</div>;
  if (error) return <div className="store-list-error">{error}</div>;

  return (
    <div className="store-list">
      <h2 className="store-list-title">Stores</h2>
      <div className="store-grid">
        {stores.map(s => (
          <div key={s.id} className="store-card">
            <h3>{s.name}</h3>
            <p>{s.address}</p>
            <p>{s.email}</p>
            <p>Owner: {s.ownerName}</p>
            <p>Avg Rating: {s.avgRating} ({s.ratingCount})</p>
            <div className="your-rating">
              <p>Your Rating:</p>
              <RatingStars
                rating={userRatings[s.id] || 0}
                setRating={r => handleRate(s.id, r)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreList;