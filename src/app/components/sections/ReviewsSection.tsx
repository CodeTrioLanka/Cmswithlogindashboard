import { Star, Plus, Trash2 } from 'lucide-react';
import type { ReviewData } from '@/app/App';

interface ReviewsSectionProps {
  data: ReviewData[];
  onChange: (data: ReviewData[]) => void;
}

export function ReviewsSection({ data, onChange }: ReviewsSectionProps) {
  const addReview = () => {
    onChange([...data, { name: '', rating: 5, comment: '', date: new Date().toISOString().split('T')[0] }]);
  };

  const removeReview = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updateReview = (index: number, field: keyof ReviewData, value: string | number) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
          <p className="text-sm text-gray-600 mt-1">Manage testimonials and reviews</p>
        </div>
        <button
          onClick={addReview}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Review
        </button>
      </div>

      {data.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h4>
          <p className="text-gray-600 mb-6">Add customer testimonials and reviews</p>
          <button
            onClick={addReview}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Your First Review
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {data.map((review, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <h4 className="font-semibold text-gray-900">Review #{index + 1}</h4>
                </div>
                <button
                  onClick={() => removeReview(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Remove review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                  <input
                    type="text"
                    value={review.name}
                    onChange={(e) => updateReview(index, 'name', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter customer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={review.rating}
                    onChange={(e) => updateReview(index, 'rating', parseInt(e.target.value) || 5)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="5"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Review Comment</label>
                  <textarea
                    value={review.comment}
                    onChange={(e) => updateReview(index, 'comment', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter review comment"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={review.date}
                    onChange={(e) => updateReview(index, 'date', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
