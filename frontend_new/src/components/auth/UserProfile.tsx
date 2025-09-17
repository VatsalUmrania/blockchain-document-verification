import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { siweService } from '../../services/siweService';

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await siweService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
    }
  };

  if (!user) return null;

  return (
    <div className="user-profile">
      <div className="user-info">
        <h3>Welcome!</h3>
        <p><strong>Address:</strong> {user.address}</p>
        {user.ensName && <p><strong>ENS:</strong> {user.ensName}</p>}
        <p><strong>Last Login:</strong> {new Date(user.lastLoginAt).toLocaleString()}</p>
      </div>
      
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </div>
  );
};

export default UserProfile;
