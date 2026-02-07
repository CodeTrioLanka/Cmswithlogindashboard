/// <reference types="vite/client" />

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://nature-escape-web-back.vercel.app';

export const fetchHomeData = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/home`, {
      credentials: 'include'
    });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch home data');
    }
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    return data.homes?.[0] || null;
  } catch (error) {
    console.error('Error fetching home data:', error);
    throw error;
  }
};

export const updateHomeData = async (id: string, formData: FormData) => {
  try {
    const token = localStorage.getItem('accessToken');
    const headers: HeadersInit = {};

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}/api/home/${id}`, {
      method: 'PUT',
      headers,
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Failed to update home data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating home data:', error);
    throw error;
  }
};
