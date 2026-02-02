import { ExcursionData } from "../app/App";

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://nature-escape-web-back.vercel.app';

export const fetchExcursions = async (): Promise<ExcursionData | null> => {
    try {
        const response = await fetch(`${BASE_URL}/api/excursion`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Failed to fetch excursions');
        }
        const data = await response.json();
        if (Array.isArray(data)) {
            return data.length > 0 ? data[0] : null;
        }
        return data;
    } catch (error) {
        console.error('Error fetching excursions:', error);
        throw error;
    }
};

export const fetchExcursionFilters = async () => {
    try {
        const response = await fetch(`${BASE_URL}/api/excursion/filters`);
        if (!response.ok) {
            throw new Error('Failed to fetch excursion filters');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching excursion filters:', error);
        throw error;
    }
};

export const addExcursion = async (data: ExcursionData) => {
    try {
        const response = await fetch(`${BASE_URL}/api/excursion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: JSON.stringify(data) }),
        });

        if (!response.ok) {
            throw new Error('Failed to add excursion');
        }

        return await response.json();
    } catch (error) {
        console.error('Error adding excursion:', error);
        throw error;
    }
};

export const updateExcursion = async (id: string, data: ExcursionData) => {
    try {
        const response = await fetch(`${BASE_URL}/api/excursion/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: JSON.stringify(data) }),
        });

        if (!response.ok) {
            throw new Error('Failed to update excursion');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating excursion:', error);
        throw error;
    }
};

export const deleteExcursion = async (id: string) => {
    try {
        const response = await fetch(`${BASE_URL}/api/excursion/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete excursion');
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting excursion:', error);
        throw error;
    }
};
