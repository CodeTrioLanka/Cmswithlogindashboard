import { Briefcase, Plus, Trash2 } from 'lucide-react';
import type { ServiceData } from '@/app/App';

interface ServicesSectionProps {
  data: ServiceData[];
  onChange: (data: ServiceData[]) => void;
}

export function ServicesSection({ data, onChange }: ServicesSectionProps) {
  const addService = () => {
    onChange([...data, { title: '', description: '', icon: '' }]);
  };

  const removeService = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: keyof ServiceData, value: string) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Services</h3>
          <p className="text-sm text-gray-600 mt-1">Manage your service offerings</p>
        </div>
        <button
          onClick={addService}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {data.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No services yet</h4>
          <p className="text-gray-600 mb-6">Add the services you offer to your customers</p>
          <button
            onClick={addService}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Your First Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((service, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">Service #{index + 1}</h4>
                </div>
                <button
                  onClick={() => removeService(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Remove service"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Title</label>
                  <input
                    type="text"
                    value={service.title}
                    onChange={(e) => updateService(index, 'title', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter service title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={service.description}
                    onChange={(e) => updateService(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter service description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon Name</label>
                  <input
                    type="text"
                    value={service.icon}
                    onChange={(e) => updateService(index, 'icon', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., map, plane, car"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use Lucide React icon names</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
