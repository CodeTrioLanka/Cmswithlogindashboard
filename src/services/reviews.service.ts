const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Review {
    _id?: string;
    name: string;
    email?: string;
    rating: number;
    reviewText: string;
    source: 'google' | 'user' | 'admin';
    googleReviewId?: string;
    isApproved: boolean;
    isVisible: boolean;
    reviewDate: string;
    avatarUrl?: string;
    googleData?: {
        authorUrl?: string;
        relativeTimeDescription?: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface ReviewStats {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: Array<{
        _id: number;
        count: number;
    }>;
}

export interface AdminStats {
    bySource: Array<{
        _id: string;
        count: number;
        avgRating: number;
    }>;
    pendingApproval: number;
}

export interface PaginationData {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export interface ReviewsResponse {
    success: boolean;
    data: Review[];
    pagination: PaginationData;
    stats?: AdminStats;
}

export interface ReviewStatsResponse {
    success: boolean;
    data: ReviewStats;
}

export interface SingleReviewResponse {
    success: boolean;
    message: string;
    data: Review;
}

export interface DeleteResponse {
    success: boolean;
    message: string;
}

export interface GoogleSyncResponse {
    success: boolean;
    message: string;
    data: {
        total: number;
        new: number;
        updated: number;
        errors: number;
    };
}

export interface ReviewFilters {
    source?: 'google' | 'user' | 'admin';
    isApproved?: boolean;
    rating?: number;
    page?: number;
    limit?: number;
}

class ReviewsService {
    private getAuthHeaders() {
        return {
            'Content-Type': 'application/json'
        };
    }

    /**
     * Get all reviews with filters (Admin)
     */
    async getAllReviews(filters?: ReviewFilters): Promise<ReviewsResponse> {
        const params = new URLSearchParams();

        if (filters?.source) params.append('source', filters.source);
        if (filters?.isApproved !== undefined) params.append('isApproved', String(filters.isApproved));
        if (filters?.rating) params.append('rating', String(filters.rating));
        if (filters?.page) params.append('page', String(filters.page));
        if (filters?.limit) params.append('limit', String(filters.limit));

        const queryString = params.toString();
        const url = `${API_BASE_URL}/reviews/all${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch reviews');
        }

        return response.json();
    }

    /**
     * Get review statistics (Public)
     */
    async getReviewStats(): Promise<ReviewStatsResponse> {
        const response = await fetch(`${API_BASE_URL}/reviews/stats`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch statistics');
        }

        return response.json();
    }

    /**
     * Add a new admin review
     */
    async addAdminReview(reviewData: {
        name: string;
        email?: string;
        rating: number;
        reviewText: string;
        avatarUrl?: string;
        reviewDate?: string;
    }): Promise<SingleReviewResponse> {
        const response = await fetch(`${API_BASE_URL}/reviews/admin`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(reviewData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add review');
        }

        return response.json();
    }

    /**
     * Update an existing review (Admin)
     */
    async updateReview(id: string, reviewData: {
        name?: string;
        email?: string;
        rating?: number;
        reviewText?: string;
        avatarUrl?: string;
        isVisible?: boolean;
    }): Promise<SingleReviewResponse> {
        const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(reviewData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update review');
        }

        return response.json();
    }

    /**
     * Delete a review (Admin)
     */
    async deleteReview(id: string): Promise<DeleteResponse> {
        const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete review');
        }

        return response.json();
    }

    /**
     * Approve a pending review (Admin)
     */
    async approveReview(id: string): Promise<SingleReviewResponse> {
        const response = await fetch(`${API_BASE_URL}/reviews/${id}/approve`, {
            method: 'PATCH',
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to approve review');
        }

        return response.json();
    }

    /**
     * Toggle review visibility (Admin)
     */
    async toggleVisibility(id: string, isVisible?: boolean): Promise<SingleReviewResponse> {
        const response = await fetch(`${API_BASE_URL}/reviews/${id}/visibility`, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ isVisible })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to toggle visibility');
        }

        return response.json();
    }

    /**
     * Sync Google reviews (Admin)
     */
    async syncGoogleReviews(): Promise<GoogleSyncResponse> {
        const response = await fetch(`${API_BASE_URL}/reviews/google/sync`, {
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to sync Google reviews');
        }

        return response.json();
    }
}

export const reviewsService = new ReviewsService();
