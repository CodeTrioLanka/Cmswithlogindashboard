/// <reference types="vite/client" />

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://nature-escape-web-back.vercel.app';

export const fetchHomeData = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/home`, {
      credentials: 'include'
    });
    const data = await response.json();
    if (data.homes && data.homes.length > 0) {
      return data.homes[0];
    }
    return null;
  } catch (error) {
    console.error('Error fetching home data:', error);
    throw error;
  }
};

export const updateHomeData = async (id: string, formData: FormData) => {
  try {
    const response = await fetch(`${BASE_URL}/api/home/${id}`, {
      method: 'PUT',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to update home data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating home data:', error);
    throw error;
  }
};
