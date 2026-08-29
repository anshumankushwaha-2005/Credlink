import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [merchant, setMerchant] = useState(() => {
    const saved = localStorage.getItem('credlink_merchant');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  const refreshMerchant = useCallback(async () => {
    try {
      const { data } = await getMe();
      setMerchant(data.data.merchant);
      localStorage.setItem('credlink_merchant', JSON.stringify(data.data.merchant));
    } catch (err) {
      setMerchant(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('credlink_token');
    if (token) {
      refreshMerchant().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshMerchant]);

  const login = (token, merchantData) => {
    localStorage.setItem('credlink_token', token);
    localStorage.setItem('credlink_merchant', JSON.stringify(merchantData));
    setMerchant(merchantData);
  };

  const logoutLocal = () => {
    localStorage.removeItem('credlink_token');
    localStorage.removeItem('credlink_merchant');
    setMerchant(null);
  };

  return (
    <AuthContext.Provider value={{ merchant, loading, login, logout: logoutLocal, refreshMerchant }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
