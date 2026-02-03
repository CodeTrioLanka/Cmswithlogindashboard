import { useState, useEffect } from 'react';
import {
  Star,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  RefreshCw,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  AlertCircle
} from 'lucide-react';
import { reviewsService, Review, ReviewStats, ReviewFilters } from '../../../services/reviews.service';
import { ImageUploadInput } from '../ui/ImageUploadInput';

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const itemsPerPage = 10;

  // Filters
  const [filters, setFilters] = useState<ReviewFilters>({
    page: 1,
    limit: itemsPerPage
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    reviewText: '',
    avatarUrl: '',
    reviewDate: new Date().toISOString().split('T')[0]
  });

  // Load reviews and stats
  useEffect(() => {
    loadReviews();
    loadStats();
  }, [filters]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reviewsService.getAllReviews(filters);
      setReviews(response.data);
      setTotalReviews(response.pagination.total);
      setTotalPages(response.pagination.pages);
      setCurrentPage(response.pagination.page);

      if (response.stats) {
        setPendingCount(response.stats.pendingApproval);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await reviewsService.getReviewStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleAddReview = () => {
    setEditingReview(null);
    setFormData({
      name: '',
      email: '',
      rating: 5,
      reviewText: '',
      avatarUrl: '',
      reviewDate: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleEditReview = (review: Review) => {
    if (review.source === 'google') {
      showError('Cannot edit Google reviews');
      return;
    }
    setEditingReview(review);
    setFormData({
      name: review.name,
      email: review.email || '',
      rating: review.rating,
      reviewText: review.reviewText,
      avatarUrl: review.avatarUrl || '',
      reviewDate: review.reviewDate.split('T')[0]
    });
    setShowModal(true);
  };

  const handleSaveReview = async () => {
    try {
      setError(null);

      if (!formData.name || !formData.reviewText || !formData.rating) {
        showError('Name, rating, and review text are required');
        return;
      }

      if (editingReview) {
        // Update existing review
        await reviewsService.updateReview(editingReview._id!, {
          name: formData.name,
          email: formData.email,
          rating: formData.rating,
          reviewText: formData.reviewText,
          avatarUrl: formData.avatarUrl
        });
        showSuccess('Review updated successfully');
      } else {
        // Add new review
        await reviewsService.addAdminReview({
          name: formData.name,
          email: formData.email,
          rating: formData.rating,
          reviewText: formData.reviewText,
          avatarUrl: formData.avatarUrl,
          reviewDate: new Date(formData.reviewDate).toISOString()
        });
        showSuccess('Review added successfully');
      }

      setShowModal(false);
      loadReviews();
      loadStats();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save review');
    }
  };

  const handleDeleteReview = async (review: Review) => {
    if (review.source === 'google') {
      showError('Cannot delete Google reviews. Use visibility toggle instead.');
      return;
    }

    if (!confirm(`Are you sure you want to delete the review by ${review.name}?`)) {
      return;
    }

    try {
      await reviewsService.deleteReview(review._id!);
      showSuccess('Review deleted successfully');
      loadReviews();
      loadStats();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete review');
    }
  };

  const handleApproveReview = async (review: Review) => {
    try {
      await reviewsService.approveReview(review._id!);
      showSuccess('Review approved successfully');
      loadReviews();
      loadStats();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to approve review');
    }
  };

  const handleToggleVisibility = async (review: Review) => {
    try {
      await reviewsService.toggleVisibility(review._id!, !review.isVisible);
      showSuccess(`Review ${!review.isVisible ? 'shown' : 'hidden'} successfully`);
      loadReviews();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to toggle visibility');
    }
  };

  const handleSyncGoogle = async () => {
    try {
      setSyncing(true);
      const response = await reviewsService.syncGoogleReviews();
      showSuccess(`Synced ${response.data.new} new and ${response.data.updated} updated Google reviews`);
      loadReviews();
      loadStats();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to sync Google reviews');
    } finally {
      setSyncing(false);
    }
  };

  const handleFilterChange = (key: keyof ReviewFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filter changes
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: itemsPerPage
    });
    setSearchTerm('');
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const getSourceBadge = (source: string) => {
    const colors = {
      google: 'bg-blue-100 text-blue-800',
      user: 'bg-purple-100 text-purple-800',
      admin: 'bg-green-100 text-green-800'
    };
    return colors[source as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
          />
        ))}
      </div>
    );
  };

  const filteredReviews = reviews.filter(review => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      review.name.toLowerCase().includes(search) ||
      review.reviewText.toLowerCase().includes(search) ||
      review.email?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
          <p className="text-sm text-gray-600 mt-1">Manage testimonials and reviews</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSyncGoogle}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Google'}
          </button>
          <button
            onClick={handleAddReview}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-700 to-emerald-600 text-white rounded-lg hover:from-green-800 hover:to-emerald-700 transition-all shadow-md font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Review
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalReviews}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.averageRating.toFixed(1)}
                </p>
              </div>
              <div className="flex flex-col items-end">
                {renderStars(Math.round(stats.averageRating))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div>
              <p className="text-sm text-gray-600 mb-2">Rating Distribution</p>
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map(rating => {
                  const dist = stats.ratingDistribution.find(d => d._id === rating);
                  const count = dist?.count || 0;
                  const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center gap-2 text-xs">
                      <span className="w-3">{rating}</span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-gray-600">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h4 className="font-semibold text-gray-900">Filters</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reviews..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Source Filter */}
          <select
            value={filters.source || ''}
            onChange={(e) => handleFilterChange('source', e.target.value || undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Sources</option>
            <option value="google">Google</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          {/* Approval Filter */}
          <select
            value={filters.isApproved === undefined ? '' : String(filters.isApproved)}
            onChange={(e) => handleFilterChange('isApproved', e.target.value === '' ? undefined : e.target.value === 'true')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="true">Approved</option>
            <option value="false">Pending</option>
          </select>

          {/* Rating Filter */}
          <select
            value={filters.rating || ''}
            onChange={(e) => handleFilterChange('rating', e.target.value ? Number(e.target.value) : undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        {(filters.source || filters.isApproved !== undefined || filters.rating || searchTerm) && (
          <button
            onClick={handleClearFilters}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-green-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Avatar */}
                  <div className="image-preview-avatar flex-shrink-0">
                    {review.avatarUrl ? (
                      <img src={review.avatarUrl} alt={review.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-green-500 text-white font-semibold text-lg">
                        {review.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Review Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{review.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSourceBadge(review.source)}`}>
                        {review.source}
                      </span>
                      {!review.isApproved && review.source === 'user' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Pending
                        </span>
                      )}
                      {!review.isVisible && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Hidden
                        </span>
                      )}
                    </div>

                    {review.email && (
                      <p className="text-sm text-gray-600 mb-2">{review.email}</p>
                    )}

                    <div className="flex items-center gap-3 mb-3">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">
                        {new Date(review.reviewDate).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-gray-700 leading-relaxed">{review.reviewText}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {!review.isApproved && review.source === 'user' && (
                    <button
                      onClick={() => handleApproveReview(review)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                      title="Approve review"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}

                  <button
                    onClick={() => handleToggleVisibility(review)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title={review.isVisible ? 'Hide review' : 'Show review'}
                  >
                    {review.isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>

                  {review.source !== 'google' && (
                    <>
                      <button
                        onClick={() => handleEditReview(review)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
                        title="Edit review"
                      >
                        <Edit className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleDeleteReview(review)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete review"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalReviews)} of {totalReviews} reviews
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded-lg transition-all ${currentPage === pageNum
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingReview ? 'Edit Review' : 'Add New Review'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Customer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="customer@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value={5}>5 Stars - Excellent</option>
                    <option value={4}>4 Stars - Very Good</option>
                    <option value={3}>3 Stars - Good</option>
                    <option value={2}>2 Stars - Fair</option>
                    <option value={1}>1 Star - Poor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Date
                  </label>
                  <input
                    type="date"
                    value={formData.reviewDate}
                    onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avatar URL
                </label>
                <ImageUploadInput
                  value={formData.avatarUrl}
                  onChange={(url) => setFormData({ ...formData, avatarUrl: url })}
                  placeholder="Avatar Image URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.reviewText}
                  onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Enter the review text..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReview}
                className="px-6 py-2.5 bg-gradient-to-r from-green-700 to-emerald-600 text-white rounded-lg hover:from-green-800 hover:to-emerald-700 transition-all font-medium"
              >
                {editingReview ? 'Update Review' : 'Add Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
