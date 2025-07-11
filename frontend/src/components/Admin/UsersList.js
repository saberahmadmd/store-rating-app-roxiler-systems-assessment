import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaUser, FaEdit, FaTrash, FaUserShield, FaStore } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../api';
import './UsersList.css';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/api/admin/users');
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (err) {
        setError('Failed to fetch users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/admin/users/${userId}`);
        setUsers(users.filter(user => user.id !== userId));
      } catch (err) {
        console.error('Failed to delete user:', err);
      }
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <FaUserShield className="role-icon admin" />;
      case 'store_owner':
        return <FaStore className="role-icon owner" />;
      default:
        return <FaUser className="role-icon user" />;
    }
  };

  if (loading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="users-list">
      <div className="header">
        <h2 className="title">User Management</h2>
        <Link to="/admin/add-user" className="add-btn">+ Add User</Link>
      </div>

      <div className="search-box">
        <FaSearch className="search-icon" />
        <input
          className="search-input"
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">No users found</td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.address}</td>
                  <td className="role-cell">
                    {getRoleIcon(user.role)}
                    <span className="role-text">{user.role.replace('_', ' ')}</span>
                  </td>
                  <td className="actions">
                    <Link to={`/admin/users/${user.id}`} className="edit-btn" title="Edit">
                      <FaEdit />
                    </Link>
                    <button onClick={() => handleDelete(user.id)} className="delete-btn" title="Delete">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersList;