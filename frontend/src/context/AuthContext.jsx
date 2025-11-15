import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start as true

  // This effect runs only once when the app starts
  useEffect(() => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo) {
        setUser(userInfo);
      }
    } catch (error) {
      console.error("Failed to parse user info from localStorage", error);
      setUser(null);
      localStorage.removeItem('userInfo');
    } finally {
      // Set loading to false after we've checked localStorage
      setLoading(false);
    }
  }, []); // The empty array ensures this runs only on initial mount

  const loginUser = (userData) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};