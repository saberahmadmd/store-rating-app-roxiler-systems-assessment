import { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';
import { FaStar } from 'react-icons/fa';

const UserDashboard = () => {
  const [dashboardData, setDashboardData] = useState({ totalRatings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        if (currentUser?.role !== 'user') {
          setError('This page is only accessible to regular users');
          return;
        }
        const res = await api.get('/api/user/dashboard');
        setDashboardData(res.data);
      } catch (err) {
        console.error('Fetch dashboard error:', err);
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [currentUser]);

  if (loading) return <div className="dashboard-loading">Loading dashboard...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;

  return (
    <div className="user-dashboard">
      <h2 className="dashboard-title">Welcome, {currentUser.name}!</h2>
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon ratings">
            <FaStar />
          </div>
          <div className="stat-info">
            <h3>Total Ratings Submitted</h3>
            <p>{dashboardData.totalRatings}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
