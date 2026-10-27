import api from './axios';

export const getInvoices = (params) => api.get('/invoices', { params });
export const getInvoice = (id) => api.get(`/invoices/${id}`);
export const createInvoice = (data) => api.post('/invoices', data);
export const updateInvoice = (id, data) => api.patch(`/invoices/${id}`, data);
export const deleteInvoice = (id) => api.delete(`/invoices/${id}`);
export const updateInvoiceStatus = (id, status) => api.patch(`/invoices/${id}/status`, { status });
export const getNextInvoiceNumber = () => api.get('/invoices/next-number');
