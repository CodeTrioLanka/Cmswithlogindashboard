/// <reference types="vite/client" />

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://nature-escape-web-back.vercel.app';

export const deleteFromCloudinary = async (imageUrl: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/api/upload/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Failed to delete image from Cloudinary:', response.status);
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};