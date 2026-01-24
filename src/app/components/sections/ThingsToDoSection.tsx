import { Activity, Plus, Trash2 } from 'lucide-react';

export function ThingsToDoSection() {
  const sampleActivities = [
    { title: 'Temple Visit', description: 'Visit ancient Buddhist temples', category: 'Culture', image: 'https://example.com/temple.jpg' },
    { title: 'Wildlife Safari', description: 'Explore national parks', category: 'Adventure', image: 'https://example.com/safari.jpg' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Things To Do</h3>
          <p className="text-sm text-gray-600 mt-1">Manage activities and attractions</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md font-medium">
          <Plus className="w-4 h-4" />
          Add Activity
        </button>
      </div>

        <div className="grid grid-cols-1 gap-6">
          {sampleActivities.map((activity, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-gray-900">Activity #{index + 1}</h4>
                </div>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Remove activity">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Activity Title</label>
                  <input
                    type="text"
                    defaultValue={activity.title}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter activity title"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    defaultValue={activity.description}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter activity description"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    defaultValue={activity.category}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., Adventure, Culture, Nature"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    type="url"
                    defaultValue={activity.image}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://example.com/activity-image.jpg"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}
