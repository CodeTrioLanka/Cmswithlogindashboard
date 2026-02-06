import { apiClient } from '../utils/apiClient';

export interface TourCategory {
    _id?: string;
    title: string;
    slug: string;
    images: string[];
    scheduleImage?: string;
    description?: string;
    isActive: boolean;
    displayOrder: number;
    createdAt?: string;
    updatedAt?: string;
}

class TourCategoriesService {
    async getTourCategories(): Promise<{ tours: TourCategory[] }> {
        return apiClient.get<{ tours: TourCategory[] }>('/tours');
    }

    async getTourCategoryById(id: string): Promise<{ tour: TourCategory }> {
        return apiClient.get<{ tour: TourCategory }>(`/tours/${id}`);
    }

    async createTourCategory(data: Omit<TourCategory, '_id' | 'createdAt' | 'updatedAt'>, images: File[]): Promise<{ tour: TourCategory; message: string }> {
        // If images are already uploaded (URLs in data.images), send JSON
        if (images.length === 0 && data.images && data.images.length > 0) {
            return apiClient.post<{ tour: TourCategory; message: string }>('/tours', data);
        }

        // Otherwise send FormData with files
        const formData = new FormData();

        // Add text fields
        formData.append('title', data.title);
        formData.append('slug', data.slug);
        formData.append('isActive', String(data.isActive));
        formData.append('displayOrder', String(data.displayOrder));
        if (data.description) formData.append('description', data.description);
        if (data.scheduleImage !== undefined) formData.append('scheduleImage', data.scheduleImage);

        // Add images
        images.forEach((image) => {
            formData.append('images', image);
        });

        return apiClient.post<{ tour: TourCategory; message: string }>('/tours', formData);
    }

    async updateTourCategory(id: string, data: Partial<TourCategory>, images?: File[]): Promise<{ tour: TourCategory; message: string }> {
        // If no new files and images are URLs in data, send JSON
        if ((!images || images.length === 0) && data.images) {
            return apiClient.put<{ tour: TourCategory; message: string }>(`/tours/${id}`, data);
        }

        // Otherwise send FormData
        const formData = new FormData();

        // Add text fields
        if (data.title) formData.append('title', data.title);
        if (data.slug) formData.append('slug', data.slug);
        if (data.description !== undefined) formData.append('description', data.description);
        if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
        if (data.displayOrder !== undefined) formData.append('displayOrder', String(data.displayOrder));
        if (data.scheduleImage !== undefined) formData.append('scheduleImage', data.scheduleImage);

        // Add images if provided
        if (images && images.length > 0) {
            images.forEach((image) => {
                formData.append('images', image);
            });
        }

        return apiClient.put<{ tour: TourCategory; message: string }>(`/tours/${id}`, formData);
    }

    async deleteTourCategory(id: string): Promise<{ message: string }> {
        return apiClient.delete<{ message: string }>(`/tours/${id}`);
    }
}

export const tourCategoriesService = new TourCategoriesService();
