import { useState, useEffect } from 'react';
import { Activity, Plus, Trash2, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import type { ThingsToDoData } from '../../App';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://nature-escape-web-back.vercel.app';

const fetchThingsToDo = async (): Promise<ThingsToDoData[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/things-to-do`);
    if (!response.ok) {
      throw new Error('Failed to fetch activities');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
};

const addThingToDo = async (activity: ThingsToDoData): Promise<ThingsToDoData> => {
  try {
    const response = await fetch(`${BASE_URL}/api/things-to-do`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activity),
    });

    if (!response.ok) {
      throw new Error('Failed to create activity');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
};

const updateThingToDo = async (id: string, activity: Partial<ThingsToDoData>): Promise<ThingsToDoData> => {
  try {
    const response = await fetch(`${BASE_URL}/api/things-to-do/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activity),
    });

    if (!response.ok) {
      throw new Error('Failed to update activity');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating activity:', error);
    throw error;
  }
};

const deleteThingToDo = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/api/things-to-do/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete activity');
    }
  } catch (error) {
    console.error('Error deleting activity:', error);
    throw error;
  }
};

interface ThingsToDoSectionProps {
  data: ThingsToDoData[];
  onChange: (data: ThingsToDoData[]) => void;
}

export function ThingsToDoSection({ data: _initialData, onChange: _onChange }: ThingsToDoSectionProps) {
  const [activities, setActivities] = useState<ThingsToDoData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newActivity, setNewActivity] = useState<ThingsToDoData>({
    title: '',
    description: '',
    image: ''
  });

  // Fetch activities on mount
  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      const data = await fetchThingsToDo();
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddActivity = async () => {
    if (newActivity.title && newActivity.description) {
      try {
        setIsLoading(true);
        await addThingToDo(newActivity);
        setNewActivity({ title: '', description: '', image: '' });
        setIsDialogOpen(false);
        await loadActivities();
      } catch (error) {
        console.error('Failed to create activity:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRemoveActivity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    try {
      await deleteThingToDo(id);
      await loadActivities();
    } catch (error) {
      console.error('Failed to delete activity:', error);
    }
  };

  // Local update handler for inputs
  const handleLocalUpdate = (index: number, field: keyof ThingsToDoData, value: string) => {
    const updatedActivities = [...activities];
    updatedActivities[index] = { ...updatedActivities[index], [field]: value };
    setActivities(updatedActivities);
  };

  // API update handler
  const handleSaveActivity = async (activity: ThingsToDoData) => {
    if (!activity._id) return;

    try {
      await updateThingToDo(activity._id, activity);
      alert('Activity updated successfully!');
    } catch (error) {
      console.error('Failed to update activity:', error);
      alert('Failed to update activity');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Things To Do</h3>
          <p className="text-sm text-gray-600 mt-1">Manage activities and attractions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md font-medium">
              <Plus className="w-4 h-4" />
              Add Activity
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Activity</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new activity or attraction.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Activity Title</Label>
                <Input
                  id="title"
                  placeholder="Enter activity title"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter activity description"
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  placeholder="https://example.com/image.jpg"
                  value={newActivity.image}
                  onChange={(e) => setNewActivity({ ...newActivity, image: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddActivity} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Activity'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && activities.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Loading activities...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {activities.map((activity, index) => (
            <div key={activity._id || index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-gray-900">Activity {index + 1}</h4>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveActivity(activity)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Save changes"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => activity._id && handleRemoveActivity(activity._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Remove activity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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
                    value={activity.title}
                    onChange={(e) => handleLocalUpdate(index, 'title', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter activity title"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={activity.description}
                    onChange={(e) => handleLocalUpdate(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter activity description"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    type="text"
                    value={activity.image}
                    onChange={(e) => handleLocalUpdate(index, 'image', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://example.com/activity-image.jpg"
                  />
                </div>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <div className="col-span-1 text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              No activities added yet. Click "Add Activity" to get started.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
