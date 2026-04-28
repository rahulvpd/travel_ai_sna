/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('tourism_token'));

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('tourism_token');
      const storedUser = localStorage.getItem('tourism_user');

      if (storedToken && storedUser) {
        try {
          const response = await fetch(`${API_BASE}/api/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          if (response.ok) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            localStorage.removeItem('tourism_token');
            localStorage.removeItem('tourism_user');
          }
        } catch (error) {
          console.error('Auth verification failed:', error);
          localStorage.removeItem('tourism_token');
          localStorage.removeItem('tourism_user');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.detail || 'Login failed' };
      }

      const data = await response.json();
      const userData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}&background=ffcc00&color=000`
      };

      setToken(data.access_token);
      setUser(userData);
      localStorage.setItem('tourism_token', data.access_token);
      localStorage.setItem('tourism_user', JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          full_name: name,
          password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.detail || 'Registration failed' };
      }

      const loginResult = await login(email, password);
      return loginResult;
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('tourism_token');
    localStorage.removeItem('tourism_user');
  };

  const getAuthHeader = () => {
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const authenticatedFetch = async (url, options = {}) => {
    const headers = {
      ...options.headers,
      ...getAuthHeader()
    };
    return fetch(url, { ...options, headers });
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, token, getAuthHeader, authenticatedFetch }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};