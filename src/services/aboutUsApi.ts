/// <reference types="vite/client" />

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://nature-escape-web-back.vercel.app';

export interface Hero {
    heroBackground: string;
    heroTitle: string;
    heroDescription: string;
}

export interface AboutUsStats {
    yearExperience: number;
    happyTravelers: number;
    toursCompleted: number;
    destination: number;
}

export interface Milestone {
    year: number;
    event: string;
    mstone_description: string;
}

export interface Value {
    icon: string;
    title: string;
    description: string;
    color: string;
}

export interface TeamMember {
    name: string;
    role: string;
    image: string;
    bio: string;
}

export interface AboutUsData {
    _id?: string;
    hero: Hero;
    stats: AboutUsStats;
    milestones: Milestone[];
    values: Value[];
    team: TeamMember[];
    createdAt?: string;
    updatedAt?: string;
}

export const fetchAboutUsData = async (): Promise<AboutUsData | null> => {
    try {
        const response = await fetch(`${BASE_URL}/api/aboutus/getData`);

        // Handle 404 or other non-OK responses gracefully
        if (!response.ok) {
            if (response.status === 404) {
                console.log('No about us data found yet');
                return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
            // Return the latest record (last in array)
            return data.data[data.data.length - 1];
        }
        return null;
    } catch (error) {
        // Only log network errors, not 404s
        if (error instanceof TypeError) {
            console.error('Network error fetching about us data:', error);
        }
        // Return null instead of throwing to allow the UI to render
        return null;
    }
};

export const createAboutUsData = async (formData: FormData): Promise<AboutUsData> => {
    try {
        const response = await fetch(`${BASE_URL}/api/aboutus/setData`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to create about us data');
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error creating about us data:', error);
        throw error;
    }
};

export const updateAboutUsData = async (id: string, formData: FormData): Promise<AboutUsData> => {
    try {
        const response = await fetch(`${BASE_URL}/api/aboutus/${id}`, {
            method: 'PUT',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to update about us data');
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error updating about us data:', error);
        throw error;
    }
};

export const deleteAboutUsData = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`${BASE_URL}/api/aboutus/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete about us data');
        }
    } catch (error) {
        console.error('Error deleting about us data:', error);
        throw error;
    }
};
