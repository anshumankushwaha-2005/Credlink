import api from './api';

export const listBills = (params) => api.get('/bills', { params });
export const getBill = (id) => api.get(`/bills/${id}`);
export const sendBillWhatsApp = (id) => api.post(`/bills/${id}/send-whatsapp`);

/**
 * Downloads a bill PDF as an authenticated request (the endpoint is JWT
 * protected) and triggers a browser save via a temporary blob URL.
 */
export async function downloadBill(id, fileName = 'receipt.pdf') {
  const res = await api.get(`/bills/${id}/download`, { responseType: 'blob' });
  const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}
