const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Package {
    _id?: string;
    packageName: string;
    slug: string;
    tourCategory: string;
    hero: {
        title: string;
        subtitle: string;
        description: string;
        backgroundImage: string;
    };
    overview: {
        duration: {
            days: number;
            nights: number;
        };
        groupSize: string;
        difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Difficult';
        price?: {
            amount: number;
            currency: string;
        };
    };
    itinerary: Array<{
        day: number;
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
    attractions: Array<{
        title: string;
        description: string;
        image: string;
    }>;
    needToKnow: {
        title: string;
        items: string[];
    };
    map: {
        image: string;
        description: string;
    };
    included: string[];
    excluded: string[];
    recommendedFor: string[];
    relatedPackages: string[];
    isActive: boolean;
    featured: boolean;
    displayOrder: number;
    createdAt?: string;
    updatedAt?: string;
}

class PackagesService {
    async getPackages(): Promise<{ packages: Package[] }> {
        const response = await fetch(`${API_BASE_URL}/packages`);
        if (!response.ok) throw new Error('Failed to fetch packages');
        return response.json();
    }

    async getPackageById(id: string): Promise<{ package: Package }> {
        const response = await fetch(`${API_BASE_URL}/packages/${id}`);
        if (!response.ok) throw new Error('Failed to fetch package');
        return response.json();
    }

    async getPackagesByCategory(categoryId: string): Promise<{ packages: Package[] }> {
        const response = await fetch(`${API_BASE_URL}/packages/category/${categoryId}`);
        if (!response.ok) throw new Error('Failed to fetch packages by category');
        return response.json();
    }

    async createPackage(
        data: Omit<Package, '_id' | 'createdAt' | 'updatedAt'>,
        files: {
            heroBackground?: File;
            mapImage?: File;
            galleryImages?: File[];
            attractionImages?: File[];
        }
    ): Promise<{ package: Package; message: string }> {
        const formData = new FormData();

        // Add JSON data
        formData.append('data', JSON.stringify(data));

        // Add files
        if (files.heroBackground) formData.append('heroBackground', files.heroBackground);
        if (files.mapImage) formData.append('mapImage', files.mapImage);

        if (files.galleryImages) {
            files.galleryImages.forEach((file) => {
                formData.append('galleryImages', file);
            });
        }

        if (files.attractionImages) {
            files.attractionImages.forEach((file) => {
                formData.append('attractionImages', file);
            });
        }

        const response = await fetch(`${API_BASE_URL}/packages`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to create package' }));
            throw new Error(errorData.error || 'Failed to create package');
        }
        return response.json();
    }

    async updatePackage(
        id: string,
        data: Partial<Package>,
        files?: {
            heroBackground?: File;
            mapImage?: File;
            galleryImages?: File[];
            attractionImages?: File[];
        }
    ): Promise<{ package: Package; message: string }> {
        const formData = new FormData();

        // Add JSON data
        formData.append('data', JSON.stringify(data));

        // Add files if provided
        if (files) {
            if (files.heroBackground) formData.append('heroBackground', files.heroBackground);
            if (files.mapImage) formData.append('mapImage', files.mapImage);

            if (files.galleryImages) {
                files.galleryImages.forEach((file) => {
                    formData.append('galleryImages', file);
                });
            }

            if (files.attractionImages) {
                files.attractionImages.forEach((file) => {
                    formData.append('attractionImages', file);
                });
            }
        }

        const response = await fetch(`${API_BASE_URL}/packages/${id}`, {
            method: 'PUT',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to update package' }));
            throw new Error(errorData.error || 'Failed to update package');
        }
        return response.json();
    }

    async deletePackage(id: string): Promise<{ message: string }> {
        const response = await fetch(`${API_BASE_URL}/packages/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete package');
        return response.json();
    }
}

export const packagesService = new PackagesService();
