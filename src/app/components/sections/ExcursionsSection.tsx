import { Compass, Plus, Trash2 } from 'lucide-react';

export function ExcursionsSection() {
  const sampleExcursions = [
    { title: 'City Tour', description: 'Explore the beautiful city attractions', location: 'Colombo, Sri Lanka', price: '$50', image: 'https://example.com/city-tour.jpg' },
    { title: 'Beach Adventure', description: 'Relax at pristine beaches', location: 'Galle, Sri Lanka', price: '$75', image: 'https://example.com/beach.jpg' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Excursions</h3>
          <p className="text-sm text-gray-600 mt-1">Manage day trips and excursion activities</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-700 to-emerald-600 text-white rounded-lg hover:from-green-800 hover:to-emerald-700 transition-all shadow-md font-medium">
          <Plus className="w-4 h-4" />
          Add Excursion
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sampleExcursions.map((excursion, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-gray-900">Excursion #{index + 1}</h4>
              </div>
              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Remove excursion">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Excursion Title</label>
                <input
                  type="text"
                  defaultValue={excursion.title}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Enter excursion title"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  defaultValue={excursion.description}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                  placeholder="Enter excursion description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  defaultValue={excursion.location}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="e.g., Colombo, Sri Lanka"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <input
                  type="text"
                  defaultValue={excursion.price}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="e.g., $50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  defaultValue={excursion.image}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="https://example.com/excursion-image.jpg"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
