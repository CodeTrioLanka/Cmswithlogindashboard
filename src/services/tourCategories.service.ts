const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://nature-escape-web-back.vercel.app';
const API_BASE_URL = `${BASE_URL}/api`;

export interface TourCategory {
    _id?: string;
    title: string;
    slug: string;
    images: string[];
    description?: string;
    isActive: boolean;
    displayOrder: number;
    createdAt?: string;
    updatedAt?: string;
}

class TourCategoriesService {
    async getTourCategories(): Promise<{ tours: TourCategory[] }> {
        const response = await fetch(`${API_BASE_URL}/tours`);
        if (!response.ok) throw new Error('Failed to fetch tour categories');
        return response.json();
    }

    async getTourCategoryById(id: string): Promise<{ tour: TourCategory }> {
        const response = await fetch(`${API_BASE_URL}/tours/${id}`);
        if (!response.ok) throw new Error('Failed to fetch tour category');
        return response.json();
    }

    async createTourCategory(data: Omit<TourCategory, '_id' | 'createdAt' | 'updatedAt'>, images: File[]): Promise<{ tour: TourCategory; message: string }> {
        // If images are already uploaded (URLs in data.images), send JSON
        if (images.length === 0 && data.images && data.images.length > 0) {
            const response = await fetch(`${API_BASE_URL}/tours`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to create tour category');
            return response.json();
        }

        // Otherwise send FormData with files
        const formData = new FormData();

        // Add text fields
        formData.append('title', data.title);
        formData.append('slug', data.slug);
        formData.append('isActive', String(data.isActive));
        formData.append('displayOrder', String(data.displayOrder));
        if (data.description) formData.append('description', data.description);

        // Add images
        images.forEach((image) => {
            formData.append('images', image);
        });

        const response = await fetch(`${API_BASE_URL}/tours`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to create tour category');
        return response.json();
    }

    async updateTourCategory(id: string, data: Partial<TourCategory>, images?: File[]): Promise<{ tour: TourCategory; message: string }> {
        // If no new files and images are URLs in data, send JSON
        if ((!images || images.length === 0) && data.images) {
            const response = await fetch(`${API_BASE_URL}/tours/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to update tour category');
            return response.json();
        }

        // Otherwise send FormData
        const formData = new FormData();

        // Add text fields
        if (data.title) formData.append('title', data.title);
        if (data.slug) formData.append('slug', data.slug);
        if (data.description !== undefined) formData.append('description', data.description);
        if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
        if (data.displayOrder !== undefined) formData.append('displayOrder', String(data.displayOrder));

        // Add images if provided
        if (images && images.length > 0) {
            images.forEach((image) => {
                formData.append('images', image);
            });
        }

        const response = await fetch(`${API_BASE_URL}/tours/${id}`, {
            method: 'PUT',
            body: formData,
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to update tour category');
        return response.json();
    }

    async deleteTourCategory(id: string): Promise<{ message: string }> {
        const response = await fetch(`${API_BASE_URL}/tours/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to delete tour category');
        return response.json();
    }
}

export const tourCategoriesService = new TourCategoriesService();
