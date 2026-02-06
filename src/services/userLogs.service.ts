import { apiClient } from '../utils/apiClient';

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

        const queryString = queryParams.toString();
        const url = `/logs${queryString ? `?${queryString}` : ''}`;

        return apiClient.get<LogsResponse>(url);
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

        const queryString = queryParams.toString();
        const url = `/logs/stats${queryString ? `?${queryString}` : ''}`;

        return apiClient.get<LogStats>(url);
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
        return apiClient.delete<{ success: boolean; message: string; deletedCount: number }>(`/logs/cleanup?days=${days}`);
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
