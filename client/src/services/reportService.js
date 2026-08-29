import api from './api';

export const getCustomerReport = (id, params) => api.get(`/reports/customer/${id}`, { params });

/** Downloads the customer statement PDF (authenticated) via a blob URL. */
export async function downloadCustomerStatement(id, params = {}, fileName = 'statement.pdf') {
  const res = await api.get(`/reports/customer/${id}/pdf`, { params, responseType: 'blob' });
  const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}
