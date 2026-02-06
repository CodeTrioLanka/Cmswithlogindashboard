import { apiClient } from '../utils/apiClient';

export interface Package {
    _id?: string;
    packageName: string;
    slug: string;
    tourCategory: string;
    hero: {
        title: string;
        description: string;
        backgroundImage: string;
    };
    overview: {
        duration: {
            days: number;
            nights: number;
        };
        groupSize: string;
    };
    itinerary: Array<{
        day: string;
        title: string;
        activities: string[];
        description: string;
        accommodation: string;
        meals: {
            breakfast: boolean;
            lunch: boolean;
            dinner: boolean;
        };
    }>;
    galleries: Array<{
        title: string;
        images: string[];
    }>;
    isActive: boolean;
    featured: boolean;
    displayOrder: number;
    createdAt?: string;
    updatedAt?: string;
}

class PackagesService {
    async getPackages(): Promise<{ packages: Package[] }> {
        return apiClient.get<{ packages: Package[] }>('/packages');
    }

    async getPackageBySlug(slug: string): Promise<Package> {
        return apiClient.get<Package>(`/packages/slug/${slug}`);
    }

    async createPackage(data: Omit<Package, '_id'>): Promise<any> {
        const packageData = JSON.parse(JSON.stringify(data));
        const formData = new FormData();
        formData.append('data', JSON.stringify(packageData));

        return apiClient.post<any>('/packages', formData);
    }

    async updatePackage(id: string, data: Partial<Package>): Promise<any> {
        const packageData = JSON.parse(JSON.stringify(data));
        const formData = new FormData();
        formData.append('data', JSON.stringify(packageData));

        return apiClient.put<any>(`/packages/${id}`, formData);
    }

    async deletePackage(id: string): Promise<any> {
        return apiClient.delete<any>(`/packages/${id}`);
    }
}

export const packagesService = new PackagesService();
