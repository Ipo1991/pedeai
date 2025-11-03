// update logout handler to use AuthContext
import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const DashboardScreen = () => {
  const auth = useContext(AuthContext)!;
  const handleLogout = () => auth.signOut();
  return null;
};

export default DashboardScreen;