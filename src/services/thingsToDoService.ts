import { ThingsToDoData } from "../app/App";

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://nature-escape-web-back.vercel.app';

export const getThingsToDo = async (): Promise<ThingsToDoData | null> => {
    try {
        const response = await fetch(`${BASE_URL}/api/things-to-do`, {
            credentials: 'include'
        });
        if (!response.ok) {
            // If 404, it might mean no data created yet, return null
            if (response.status === 404) return null;
            throw new Error(`Failed to fetch things to do data: ${response.statusText}`);
        }
        const data = await response.json();

        // Backend returns an array of documents, we only need the first one (singleton pattern)
        if (Array.isArray(data)) {
            return data.length > 0 ? data[0] : null;
        }
        return data; // Fallback if it returns a single object
    } catch (error) {
        console.error('Error fetching things to do:', error);
        throw error;
    }
};

export const createThingsToDo = async (data: ThingsToDoData): Promise<ThingsToDoData> => {
    try {
        const response = await fetch(`${BASE_URL}/api/things-to-do`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Backend expects { data: "JSON_STRING" }
            body: JSON.stringify({ data: JSON.stringify(data) }),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to create things to do data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating things to do:', error);
        throw error;
    }
};

export const updateThingsToDo = async (id: string, data: ThingsToDoData): Promise<ThingsToDoData> => {
    try {
        const response = await fetch(`${BASE_URL}/api/things-to-do/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            // Backend expects { data: "JSON_STRING" }
            body: JSON.stringify({ data: JSON.stringify(data) }),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to update things to do data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating things to do:', error);
        throw error;
    }
};
