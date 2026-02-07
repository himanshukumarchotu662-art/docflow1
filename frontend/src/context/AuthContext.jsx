import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import api, { updateProfile as apiUpdateProfile } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        logout();
      } else {
        fetchUser();
      }
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      const { _id, ...rest } = response.data;
      // Normalize _id to id for frontend consistency
      setUser({ id: _id, ...rest });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, _id, ...rest } = response.data;
      
      // Normalize _id to id for frontend consistency
      const userData = { id: _id, ...rest };
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(userData);
      
      toast.success('Login successful!');
      return { success: true, user: userData };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, ...userDataWithoutToken } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(userDataWithoutToken);
      
      toast.success('Registration successful!');
      return { success: true, user: userDataWithoutToken };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.info('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await apiUpdateProfile(profileData);
      console.log('Update Profile API Response:', response.data);
      const { token: newToken, _id, ...rest } = response.data;
      
      // Normalize and update state
      const userData = { id: _id, ...rest };
      setUser(userData);
      
      if (newToken) {
        localStorage.setItem('token', newToken);
        setToken(newToken);
      }
      
      toast.success('Profile updated successfully');
      return { success: true, user: userData };
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.response?.data?.message || 'Update failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};