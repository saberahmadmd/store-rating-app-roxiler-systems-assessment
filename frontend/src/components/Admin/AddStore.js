import { useState, useEffect } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import {
  FaStore,
  FaEnvelope,
  FaHome,
  FaUser
} from 'react-icons/fa';
import './AddStore.css';

const AddStore = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [owners, setOwners] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch all store_owner accounts dynamically
  useEffect(() => {
    async function fetchOwners() {
      try {
        const res = await api.get('/api/admin/users?role=store_owner');
        setOwners(res.data);
      } catch {
        setError('Failed to load store owners');
      }
    }
    fetchOwners();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ownerId) {
      setError('Please select a store owner');
      return;
    }
    try {
      setError('');
      setLoading(true);
      await api.post('/api/admin/stores', {
        name,
        email,
        address,
        ownerId
      });
      navigate('/admin/stores');
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0]?.msg ||
        'Failed to add store'
      );
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Add New Store</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            <FaStore className="input-icon" /> Store Name
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
            <FaEnvelope className="input-icon" /> Store Email
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
          <label htmlFor="address" className="form-label">
            <FaHome className="input-icon" /> Store Address
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
          <label htmlFor="ownerId" className="form-label">
            <FaUser className="input-icon" /> Store Owner
          </label>
          <select
            id="ownerId"
            className="form-control"
            value={ownerId}
            onChange={e => setOwnerId(e.target.value)}
            required
          >
            <option value="">Select Owner</option>
            {owners.map(o => (
              <option key={o.id} value={o.id}>
                {o.name} ({o.email})
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="form-btn"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Store'}
        </button>
      </form>
    </div>
  );
};

export default AddStore;