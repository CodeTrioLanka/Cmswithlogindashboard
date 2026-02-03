
const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://nature-escape-web-back.vercel.app';
const API_BASE_URL = `${BASE_URL}/api`;

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
    isActive: boolean;
    featured: boolean;
    displayOrder: number;
    createdAt?: string;
    updatedAt?: string;
}

class PackagesService {
    private getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    private getMultiPartHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    async getPackages(): Promise<{ packages: Package[] }> {
        const response = await fetch(`${API_BASE_URL}/packages`);
        if (!response.ok) throw new Error('Failed to fetch packages');
        return response.json();
    }

    async getPackageBySlug(slug: string): Promise<Package> {
        const response = await fetch(`${API_BASE_URL}/packages/slug/${slug}`);
        if (!response.ok) throw new Error('Failed to fetch package');
        return response.json();
    }

    async createPackage(data: Omit<Package, '_id'>, files?: any): Promise<any> {
        // Create a deep copy of the data
        const packageData = JSON.parse(JSON.stringify(data));

        // Note: For create, we rely on the component to have already uploaded images
        // and placed the URLs into the packageData structure.
        // This service method now primarily handles the JSON data submission.

        // However, to maintain compatibility with existing controller if it expects multipart/form-data
        // We will stick to the previous pattern if file uploads are handled by the controller
        // But based on the "uploadToCloudinary" usage in the component, it seems we are moving to
        // client-side upload or separate upload calls.
        // Let's assume the controller expects 'data' field with JSON string for complex objects.

        const formData = new FormData();
        formData.append('data', JSON.stringify(packageData));

        const response = await fetch(`${API_BASE_URL}/packages`, {
            method: 'POST',
            headers: this.getMultiPartHeaders(),
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create package');
        }
        return response.json();
    }

    async updatePackage(id: string, data: Partial<Package>, files?: any): Promise<any> {
        const packageData = JSON.parse(JSON.stringify(data));

        const formData = new FormData();
        formData.append('data', JSON.stringify(packageData));

        const response = await fetch(`${API_BASE_URL}/packages/${id}`, {
            method: 'PUT',
            headers: this.getMultiPartHeaders(),
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update package');
        }
        return response.json();
    }

    async deletePackage(id: string): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/packages/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete package');
        return response.json();
    }
}

export const packagesService = new PackagesService();
