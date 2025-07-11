import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FaStore, FaStar, FaUsers } from 'react-icons/fa';
import './Dashboard.css';

const OwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/api/owner/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="dashboard-loading">Loading dashboard...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;

  return (
    <div className="owner-dashboard">
      <h2 className="dashboard-title">Owner Dashboard</h2>
      <div className="dashboard-stats">
        <div className="stat-card">
          <FaStore size={32} />
          <div>
            <h3>Total Stores</h3>
            <p>{data.totalStores}</p>
          </div>
        </div>
        <div className="stat-card">
          <FaStar size={32} />
          <div>
            <h3>Total Ratings</h3>
            <p>{data.totalRatings}</p>
          </div>
        </div>
        <div className="stat-card">
          <FaUsers size={32} />
          <div>
            <h3>Average Rating</h3>
            <p>{data.avgRating}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;