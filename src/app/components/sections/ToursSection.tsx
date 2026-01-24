import { MapPin, Plus, Trash2 } from 'lucide-react';

export function ToursSection() {
  const sampleTours = [
    { title: 'Cultural Triangle Tour', description: 'Explore ancient cities and temples', duration: '7 Days / 6 Nights', price: '$899', image: 'https://example.com/cultural-tour.jpg' },
    { title: 'Beach & Hill Country', description: 'Beaches and tea plantations', duration: '5 Days / 4 Nights', price: '$699', image: 'https://example.com/beach-hill.jpg' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sri Lanka Tours</h3>
          <p className="text-sm text-gray-600 mt-1">Manage tour packages and offerings</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md font-medium">
          <Plus className="w-4 h-4" />
          Add Tour
        </button>
      </div>

        <div className="grid grid-cols-1 gap-6">
          {sampleTours.map((tour, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">Tour Package #{index + 1}</h4>
                </div>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Remove tour">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tour Title</label>
                  <input
                    type="text"
                    defaultValue={tour.title}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter tour title"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    defaultValue={tour.description}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter tour description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <input
                    type="text"
                    defaultValue={tour.duration}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., 5 Days / 4 Nights"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <input
                    type="text"
                    defaultValue={tour.price}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., $999"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    type="url"
                    defaultValue={tour.image}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://example.com/tour-image.jpg"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}
