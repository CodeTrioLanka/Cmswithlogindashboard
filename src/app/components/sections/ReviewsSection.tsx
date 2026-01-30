import { Star, Plus, Trash2 } from 'lucide-react';

export function ReviewsSection() {
  const sampleReviews = [
    { name: 'John Doe', rating: 5, comment: 'Amazing tour experience!', date: '2024-01-15' },
    { name: 'Jane Smith', rating: 4, comment: 'Great service and beautiful locations.', date: '2024-01-10' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
          <p className="text-sm text-gray-600 mt-1">Manage testimonials and reviews</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-700 to-emerald-600 text-white rounded-lg hover:from-green-800 hover:to-emerald-700 transition-all shadow-md font-medium">
          <Plus className="w-4 h-4" />
          Add Review
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sampleReviews.map((review, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <h4 className="font-semibold text-gray-900">Review #{index + 1}</h4>
              </div>
              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Remove review">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                <input
                  type="text"
                  defaultValue={review.name}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  defaultValue={review.rating}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="5"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Review Comment</label>
                <textarea
                  defaultValue={review.comment}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                  placeholder="Enter review comment"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  defaultValue={review.date}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
