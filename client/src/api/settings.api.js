import api from './axios';

export const getAppearance = () => api.get('/settings/appearance');
export const updateAppearance = (data) => api.put('/settings/appearance', data);
