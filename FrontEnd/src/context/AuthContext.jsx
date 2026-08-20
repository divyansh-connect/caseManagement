import React, { createContext, useContext, useState, useEffect } from 'react';
import { USER_ROLES } from '../data/stageConfig';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        try {
          // Verify token or get user info
          const data = await api.get('/auth/me');
          if (data && data.success && data.user) {
            setUser(data.user);
          } else {
            localStorage.removeItem('jwt_token');
            setUser(null);
          }
        } catch (err) {
          localStorage.removeItem('jwt_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

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
    localStorage.removeItem('jwt_token');
    setUser(null);
  };

  const login = async (email, password) => {
    try {
      const data = await api.post('/auth/login', { email, password });
      if (data.success) {
        localStorage.setItem('jwt_token', data.token);
        setUser(data.user);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, switchRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
