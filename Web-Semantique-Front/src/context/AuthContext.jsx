import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '@/services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (storedUser && token) {
          // Parse and set user immediately for better UX
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (err) {
        console.error('Error loading user from storage:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Login user
   */
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await api.login(email, password);
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);

      return response;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await api.register(userData);
      
      // Auto-login after registration
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
      }

      return response;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      setError(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (updates) => {
    try {
      setError(null);
      const updatedUser = { ...user, ...updates };
      
      // Update in backend
      await api.updateTouriste(user.uri, updates);
      
      // Update local state
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (err) {
      setError(err.message || 'Profile update failed');
      throw err;
    }
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('token');
  };

  /**
   * Check if user is a guide
   */
  const isGuide = () => {
    return user?.type === 'Guide';
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated,
    isGuide,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}

export default AuthContext;

