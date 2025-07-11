import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Common/Header';
import Sidebar from './components/Common/Sidebar';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';

import AdminDashboard from './components/Admin/Dashboard';
import UsersList from './components/Admin/UsersList';
import StoresList from './components/Admin/StoresList';
import AddUser from './components/Admin/AddUser';
import AddStore from './components/Admin/AddStore';

import UserDashboard from './components/User/Dashboard';
import UserStoreList from './components/User/StoreList';
import MyRatings from './components/User/MyRatings';
import PasswordUpdate from './components/User/PasswordUpdate';

import OwnerDashboard from './components/Owner/Dashboard';
import StoreList from './components/Owner/StoreList';
import RatingsList from './components/Owner/RatingsList';

import AdminPage from './pages/AdminPage';
import UserPage from './pages/UserPage';
import OwnerPage from './pages/OwnerPage';
import HomePage from './pages/HomePage';

import './App.css';
import { useState } from 'react';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && currentUser.role !== requiredRole) return <Navigate to="/" replace />;
  return children;
};

const MainLayout = ({ children }) => {
  const { currentUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Header onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
      <div className="content-wrapper">
        {currentUser && <Sidebar role={currentUser.role} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/" element={<ProtectedRoute><MainLayout><HomePage /></MainLayout></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><MainLayout><AdminPage /></MainLayout></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UsersList />} />
            <Route path="stores" element={<StoresList />} />
            <Route path="add-user" element={<AddUser />} />
            <Route path="add-store" element={<AddStore />} />
            <Route path="password" element={<PasswordUpdate />} />
          </Route>

          {/* User */}
          <Route path="/user" element={<ProtectedRoute requiredRole="user"><MainLayout><UserPage /></MainLayout></ProtectedRoute>}>
            <Route index element={<UserDashboard />} />
            <Route path="stores" element={<UserStoreList />} />
            <Route path="ratings" element={<MyRatings />} />
            <Route path="password" element={<PasswordUpdate />} />
          </Route>

          {/* Owner */}
          <Route path="/owner" element={<ProtectedRoute requiredRole="store_owner"><MainLayout><OwnerPage /></MainLayout></ProtectedRoute>}>
            <Route index element={<OwnerDashboard />} />
            <Route path="stores" element={<StoreList />} />
            <Route path="ratings" element={<RatingsList />} />
            <Route path="password" element={<PasswordUpdate />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;