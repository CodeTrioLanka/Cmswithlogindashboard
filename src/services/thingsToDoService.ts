import { ThingsToDoData } from "../app/App";

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://nature-escape-web-back.vercel.app';

export const getThingsToDo = async (): Promise<ThingsToDoData | null> => {
    try {
        const response = await fetch(`${BASE_URL}/api/things-to-do`);
        if (!response.ok) {
            // If 404, might return null to indicate no data yet
            if (response.status === 404) return null;
            throw new Error('Failed to fetch things to do data');
        }
        const data = await response.json();
        // Assuming the API returns an array of documents, we take the first one, or the document itself if it's singleton
        if (Array.isArray(data)) {
            return data.length > 0 ? data[0] : null;
        }
        return data;
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
            // Backend expects a 'data' field containing the JSON string
            body: JSON.stringify({ data: JSON.stringify(data) }),
        });
        if (!response.ok) {
            throw new Error('Failed to create things to do data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating things to do:', error);
        throw error;
    }
}

export const updateThingsToDo = async (id: string, data: ThingsToDoData): Promise<ThingsToDoData> => {
    try {
        const response = await fetch(`${BASE_URL}/api/things-to-do/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            // Backend expects a 'data' field containing the JSON string
            body: JSON.stringify({ data: JSON.stringify(data) }),
        });

        if (!response.ok) {
            throw new Error('Failed to update things to do data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating things to do:', error);
        throw error;
    }
};
