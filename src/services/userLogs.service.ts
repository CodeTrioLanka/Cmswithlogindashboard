const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://nature-escape-web-back.vercel.app';

export interface UserLog {
    _id: string;
    userId: string;
    username: string;
    role: string;
    action: string;
    details: Record<string, any>;
    timestamp: string;
    createdAt: string;
    updatedAt: string;
}

export interface LogsResponse {
    success: boolean;
    logs: UserLog[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export interface LogStats {
    success: boolean;
    stats: {
        totalLogs: number;
        topActions: Array<{ action: string; count: number }>;
        topUsers: Array<{ userId: string; username: string; count: number }>;
    };
}

export interface LogFilters {
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

/**
 * Fetch user logs with optional filters
 */
export const getUserLogs = async (filters: LogFilters = {}): Promise<LogsResponse> => {
    try {
        const queryParams = new URLSearchParams();

        if (filters.userId) queryParams.append('userId', filters.userId);
        if (filters.action) queryParams.append('action', filters.action);
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        if (filters.page) queryParams.append('page', filters.page.toString());
        if (filters.limit) queryParams.append('limit', filters.limit.toString());

        const url = `${BASE_URL}/api/logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch logs: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching user logs:', error);
        throw error;
    }
};

/**
 * Fetch log statistics
 */
export const getLogStats = async (startDate?: string, endDate?: string): Promise<LogStats> => {
    try {
        const queryParams = new URLSearchParams();

        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);

        const url = `${BASE_URL}/api/logs/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch log stats: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching log stats:', error);
        throw error;
    }
};

/**
 * Cleanup old logs
 */
export const cleanupOldLogs = async (days: number = 90): Promise<{ success: boolean; message: string; deletedCount: number }> => {
    try {
        const response = await fetch(`${BASE_URL}/api/logs/cleanup?days=${days}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to cleanup logs: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error cleaning up logs:', error);
        throw error;
    }
};

/**
 * Get unique action types from logs (for filter dropdown)
 */
export const getUniqueActions = async (): Promise<string[]> => {
    try {
        const response = await getUserLogs({ limit: 1000 }); // Get a large sample
        const uniqueActions = [...new Set(response.logs.map(log => log.action))];
        return uniqueActions.sort();
    } catch (error) {
        console.error('Error fetching unique actions:', error);
        return [];
    }
};
