import api from './api';

export const sendOtp = (email) => api.post('/auth/send-otp', { email });
export const verifyOtp = (email, otp) => api.post('/auth/verify-otp', { email, otp });
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/me', data);
export const uploadQrCode = (formData) => api.put('/auth/me/qr', formData);
export const logout = () => api.post('/auth/logout');
