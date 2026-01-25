const BASE_URL = 'http://localhost:5000';

export const deleteFromCloudinary = async (imageUrl: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/api/upload/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      console.error('Failed to delete image from Cloudinary:', response.status);
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};