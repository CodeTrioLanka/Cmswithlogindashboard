/// <reference types="vite/client" />

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://nature-escape-web-back.vercel.app';

export const changePassword = async (data: any) => {
    try {
        const response = await fetch(`${BASE_URL}/api/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Important for cookies (refreshToken/accessToken)
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to change password');
        }

        return result;
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
};

export const refreshToken = async () => {
    try {
        const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        return await response.json();
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
    }
};

// Helper function to make authenticated requests with automatic token refresh
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const makeRequest = async () => {
        return fetch(url, {
            ...options,
            credentials: 'include',
        });
    };

    let response = await makeRequest();

    // If we get a 401, try to refresh the token once
    if (response.status === 401) {
        try {
            await refreshToken();
            // Retry the original request
            response = await makeRequest();
        } catch (refreshError) {
            // Refresh failed, redirect to login
            window.location.href = '/login';
            throw refreshError;
        }
    }

    return response;
};
