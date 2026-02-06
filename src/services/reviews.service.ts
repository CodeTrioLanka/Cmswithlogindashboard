import { apiClient } from '../utils/apiClient';

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
        const url = `/reviews/all${queryString ? `?${queryString}` : ''}`;

        return apiClient.get<ReviewsResponse>(url);
    }

    /**
     * Get review statistics (Public)
     */
    async getReviewStats(): Promise<ReviewStatsResponse> {
        return apiClient.get<ReviewStatsResponse>('/reviews/stats');
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
        return apiClient.post<SingleReviewResponse>('/reviews/admin', reviewData);
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
        return apiClient.put<SingleReviewResponse>(`/reviews/${id}`, reviewData);
    }

    /**
     * Delete a review (Admin)
     */
    async deleteReview(id: string): Promise<DeleteResponse> {
        return apiClient.delete<DeleteResponse>(`/reviews/${id}`);
    }

    /**
     * Approve a pending review (Admin)
     */
    async approveReview(id: string): Promise<SingleReviewResponse> {
        return apiClient.patch<SingleReviewResponse>(`/reviews/${id}/approve`);
    }

    /**
     * Toggle review visibility (Admin)
     */
    async toggleVisibility(id: string, isVisible?: boolean): Promise<SingleReviewResponse> {
        return apiClient.patch<SingleReviewResponse>(`/reviews/${id}/visibility`, { isVisible });
    }

    /**
     * Sync Google reviews (Admin)
     */
    async syncGoogleReviews(): Promise<GoogleSyncResponse> {
        return apiClient.get<GoogleSyncResponse>('/reviews/google/sync');
    }
}

export const reviewsService = new ReviewsService();
