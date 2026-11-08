import React from "react";
import { AuthProvider, useAuth } from '../auth_context';

import '../style.css'


function Profile() {
  const { logout } = useAuth();
  const { user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      <h1>Welcome, {user?.username}</h1> 
      <button onClick={handleLogout}>Log Out?</button>
    </div>
  );
}

export default Profile;