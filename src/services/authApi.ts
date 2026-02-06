import { apiClient } from '../utils/apiClient';

export const changePassword = async (data: any) => {
    return apiClient.post('/auth/change-password', data);
};

export const refreshToken = async () => {
    return apiClient.post('/auth/refresh', { refreshToken: localStorage.getItem('refreshToken') });
};

// fetchWithAuth is removed as it's no longer needed. Clients should use apiClient directly.
