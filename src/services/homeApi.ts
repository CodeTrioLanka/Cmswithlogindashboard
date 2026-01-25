const BASE_URL = 'http://localhost:5000';

export const fetchHomeData = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/home`);
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
      body: formData
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
