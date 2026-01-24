import { Briefcase, Plus, Trash2 } from 'lucide-react';

export function ServicesSection() {
  const sampleServices = [
    { title: 'Tour Planning', description: 'Custom tour planning services', icon: 'map' },
    { title: 'Transportation', description: 'Comfortable transportation options', icon: 'car' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Services</h3>
          <p className="text-sm text-gray-600 mt-1">Manage your service offerings</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md font-medium">
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sampleServices.map((service, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">Service #{index + 1}</h4>
                </div>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Remove service">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Title</label>
                  <input
                    type="text"
                    defaultValue={service.title}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter service title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    defaultValue={service.description}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter service description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon Name</label>
                  <input
                    type="text"
                    defaultValue={service.icon}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., map, plane, car"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use Lucide React icon names</p>
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}
