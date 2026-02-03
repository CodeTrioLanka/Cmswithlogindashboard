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
