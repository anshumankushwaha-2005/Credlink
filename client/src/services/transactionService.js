import api from './api';

export const listTransactions = (params) => api.get('/transactions', { params });
export const createTransaction = (data) => api.post('/transactions', data);
export const getTransaction = (id) => api.get(`/transactions/${id}`);
export const extractVoice = (transcript, customerId) => api.post('/voice/extract', { transcript, customerId });
export const transcribeVoice = (formData) => api.post('/voice/transcribe', formData);
export const searchCustomerVoice = (formData) => api.post('/voice/search-customer', formData);
