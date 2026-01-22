import { Activity, Plus, Trash2 } from 'lucide-react';
import type { ThingsToDoData } from '@/app/App';

interface ThingsToDoSectionProps {
  data: ThingsToDoData[];
  onChange: (data: ThingsToDoData[]) => void;
}

export function ThingsToDoSection({ data, onChange }: ThingsToDoSectionProps) {
  const addActivity = () => {
    onChange([...data, { title: '', description: '', category: '', image: '' }]);
  };

  const removeActivity = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updateActivity = (index: number, field: keyof ThingsToDoData, value: string) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Things To Do</h3>
          <p className="text-sm text-gray-600 mt-1">Manage activities and attractions</p>
        </div>
        <button
          onClick={addActivity}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Activity
        </button>
      </div>

      {data.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No activities yet</h4>
          <p className="text-gray-600 mb-6">Add activities and things to do for travelers</p>
          <button
            onClick={addActivity}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Your First Activity
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {data.map((activity, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-gray-900">Activity #{index + 1}</h4>
                </div>
                <button
                  onClick={() => removeActivity(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Remove activity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Activity Title</label>
                  <input
                    type="text"
                    value={activity.title}
                    onChange={(e) => updateActivity(index, 'title', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter activity title"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={activity.description}
                    onChange={(e) => updateActivity(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter activity description"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={activity.category}
                    onChange={(e) => updateActivity(index, 'category', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., Adventure, Culture, Nature"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    type="url"
                    value={activity.image}
                    onChange={(e) => updateActivity(index, 'image', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://example.com/activity-image.jpg"
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
