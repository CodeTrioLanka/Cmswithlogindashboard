/// <reference types="vite/client" />
import { apiClient } from '../utils/apiClient';

export const fetchHomeData = async () => {
  try {
    const data = await apiClient.get<{ homes: any[] }>('/home');
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
    return await apiClient.put(`/home/${id}`, formData);
  } catch (error) {
    console.error('Error updating home data:', error);
    throw error;
  }
};
