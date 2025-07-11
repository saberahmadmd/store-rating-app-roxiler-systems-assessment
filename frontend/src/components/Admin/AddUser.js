import { useState } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaEnvelope,
  FaHome,
  FaLock,
  FaUserShield
} from 'react-icons/fa';
import './AddUser.css';

const AddUser = () => {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole]       = useState('user');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await api.post('/api/admin/users', {
        name,
        email,
        password,
        address,
        role
      });
      navigate('/admin/users');
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0]?.msg ||
        'Failed to add user'
      );
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Add New User / Owner</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            <FaUser className="input-icon" /> Name
          </label>
          <input
            type="text"
            id="name"
            className="form-control"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            <FaEnvelope className="input-icon" /> Email
          </label>
          <input
            type="email"
            id="email"
            className="form-control"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            <FaLock className="input-icon" /> Password
          </label>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <small className="form-text">
            8–16 chars, at least one uppercase & one special
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="address" className="form-label">
            <FaHome className="input-icon" /> Address
          </label>
          <textarea
            id="address"
            className="form-control"
            rows="3"
            value={address}
            onChange={e => setAddress(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="role" className="form-label">
            <FaUserShield className="input-icon" /> Role
          </label>
          <select
            id="role"
            className="form-control"
            value={role}
            onChange={e => setRole(e.target.value)}
            required
          >
            <option value="user">Normal User</option>
            <option value="store_owner">Store Owner</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          className="form-btn"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add User/Owner'}
        </button>
      </form>
    </div>
  );
};

export default AddUser;