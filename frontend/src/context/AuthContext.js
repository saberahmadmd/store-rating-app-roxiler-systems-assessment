import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      console.log('Loaded user from localStorage:', user);
      setCurrentUser(user);
      api.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      console.log('Login successful, user:', user, 'token:', token);

      localStorage.setItem('user', JSON.stringify({ ...user, token }));
      setCurrentUser({ ...user, token });
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return { success: true, role: user.role };
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Login failed' };
    }
  };

  const register = async (name, email, password, address) => {
    try {
      console.log('Registering user:', { name, email, address });
      const response = await api.post('/api/auth/register', {
        name,
        email,
        password,
        address,
        role: 'user', // Explicitly set role to 'user' for registration
      });
      console.log('Registration successful:', response.data);
      return response;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Registration failed' };
    }
  };

  const logout = () => {
    console.log('Logging out user');
    localStorage.removeItem('user');
    setCurrentUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/api/user/password', {
        currentPassword,
        newPassword,
      });
      console.log('Password updated successfully');
      return true;
    } catch (error) {
      console.error('Password update error:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Password update failed' };
    }
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    updatePassword,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin',
    isOwner: currentUser?.role === 'store_owner',
    isUser: currentUser?.role === 'user',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}