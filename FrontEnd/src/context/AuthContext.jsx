import React, { createContext, useContext, useState } from 'react';
import { USER_ROLES } from '../data/stageConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: "Case Administrator",
    email: "admin@babelglobal.com",
    role: USER_ROLES.ADMIN
  });

  const switchRole = (newRole) => {
    let name = "Case Administrator";
    let email = "admin@babelglobal.com";

    if (newRole === USER_ROLES.WRITER) {
      name = "Petition Drafter 1";
      email = "writer@babelglobal.com";
    } else if (newRole === USER_ROLES.REVIEWER) {
      name = "Senior Reviewer";
      email = "reviewer@babelglobal.com";
    } else if (newRole === USER_ROLES.CLIENT) {
      name = "Dr. Alexander Vance (Client)";
      email = "client@babelglobal.com";
    }

    setUser({ name, email, role: newRole });
  };

  const logout = () => {
    setUser(null);
  };

  const login = (email, password) => {
    setUser({
      name: "Case Administrator",
      email: email || "admin@babelglobal.com",
      role: USER_ROLES.ADMIN
    });
  };


  return (
    <AuthContext.Provider value={{ user, switchRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
