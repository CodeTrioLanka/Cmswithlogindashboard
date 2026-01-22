import { MapPin, Plus, Trash2 } from 'lucide-react';
import type { TourData } from '@/app/App';

interface ToursSectionProps {
  data: TourData[];
  onChange: (data: TourData[]) => void;
}

export function ToursSection({ data, onChange }: ToursSectionProps) {
  const addTour = () => {
    onChange([...data, { title: '', description: '', duration: '', price: '', image: '' }]);
  };

  const removeTour = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updateTour = (index: number, field: keyof TourData, value: string) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sri Lanka Tours</h3>
          <p className="text-sm text-gray-600 mt-1">Manage tour packages and offerings</p>
        </div>
        <button
          onClick={addTour}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Tour
        </button>
      </div>

      {data.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No tours yet</h4>
          <p className="text-gray-600 mb-6">Get started by adding your first tour package</p>
          <button
            onClick={addTour}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Your First Tour
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {data.map((tour, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">Tour Package #{index + 1}</h4>
                </div>
                <button
                  onClick={() => removeTour(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Remove tour"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tour Title</label>
                  <input
                    type="text"
                    value={tour.title}
                    onChange={(e) => updateTour(index, 'title', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter tour title"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={tour.description}
                    onChange={(e) => updateTour(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter tour description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <input
                    type="text"
                    value={tour.duration}
                    onChange={(e) => updateTour(index, 'duration', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., 5 Days / 4 Nights"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <input
                    type="text"
                    value={tour.price}
                    onChange={(e) => updateTour(index, 'price', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., $999"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    type="url"
                    value={tour.image}
                    onChange={(e) => updateTour(index, 'image', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://example.com/tour-image.jpg"
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
