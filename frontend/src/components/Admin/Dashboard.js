import { useState, useEffect } from 'react';
import api from '../../api';
import { FaUsers, FaStore, FaStar } from 'react-icons/fa';
import './Dashboard.css';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/api/admin/dashboard');
        console.log('Dashboard data fetched:', response.data);
        setDashboardData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Dashboard fetch error:', err.response?.data || err.message);
        setError('Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title">Admin Dashboard</h2>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon users">
            <FaUsers size={32} />
          </div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p>{dashboardData.totalUsers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stores">
            <FaStore size={32} />
          </div>
          <div className="stat-info">
            <h3>Total Stores</h3>
            <p>{dashboardData.totalStores}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon ratings">
            <FaStar size={32} />
          </div>
          <div className="stat-info">
            <h3>Total Ratings</h3>
            <p>{dashboardData.totalRatings}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;