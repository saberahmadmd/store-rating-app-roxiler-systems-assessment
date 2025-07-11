import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaLock, FaKey } from 'react-icons/fa';
import './PasswordUpdate.css';

const PasswordUpdate = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { updatePassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);
      await updatePassword(currentPassword, newPassword);
      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || 'Failed to update password');
    }

    setLoading(false);
  };

  return (
    <div className="password-update">
      <h2>Update Password</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="password-form">
        <div className="form-group">
          <label htmlFor="currentPassword" className="form-label">
            <FaKey className="input-icon" /> Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="newPassword" className="form-label">
            <FaLock className="input-icon" /> New Password
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="form-control"
            minLength="8"
            maxLength="16"
            required
          />
          <small className="form-text">
            Password must be 8-16 characters with at least one uppercase and one special character
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            <FaLock className="input-icon" /> Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="form-control"
            minLength="8"
            maxLength="16"
            required
          />
        </div>

        <button type="submit" className="update-btn" disabled={loading}>
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default PasswordUpdate;