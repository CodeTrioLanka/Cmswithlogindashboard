import { useState, useEffect } from 'react';
import { Activity, Plus, Trash2, Save, Upload, X } from 'lucide-react';
import { uploadToCloudinary } from "../../../services/cloudinaryApi";
import { deleteFromCloudinary } from "../../../services/deleteApi";
import { toast } from "sonner";
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
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  const handleFileSelect = async (file: File, indexOrNew: number | 'new') => {
    const isNew = indexOrNew === 'new';
    const oldImageUrl = isNew ? newActivity.image : activities[indexOrNew as number].image;
    const uploadKey = isNew ? 'new' : (activities[indexOrNew as number]._id || `idx-${indexOrNew}`);

    setUploading((prev) => ({ ...prev, [uploadKey]: true }));
    try {
      const url = await uploadToCloudinary(file);

      // Delete old image if it exists and is different (and hosted on cloudinary)
      if (oldImageUrl && oldImageUrl !== url && oldImageUrl.includes('cloudinary')) {
        await deleteFromCloudinary(oldImageUrl);
      }

      if (isNew) {
        setNewActivity((prev) => ({ ...prev, image: url }));
      } else {
        handleLocalUpdate(indexOrNew as number, 'image', url);
      }
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading((prev) => ({ ...prev, [uploadKey]: false }));
    }
  };

  const createFileInput = (indexOrNew: number | 'new') => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const selectedFiles = (e.target as HTMLInputElement).files;
      if (selectedFiles && selectedFiles[0]) {
        handleFileSelect(selectedFiles[0], indexOrNew);
      }
    };
    input.click();
  };

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
      await updateThingToDo(activity._id, activity);
      toast.success('Activity updated successfully!');
    } catch (error) {
      console.error('Failed to update activity:', error);
      toast.error('Failed to update activity');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Things To Do</h3>
          <p className="text-sm text-gray-600 mt-1">Manage activities and attractions</p>
        </div>

        {/* POPUP BOX */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md font-medium">
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
                <Label htmlFor="image">Image</Label>
                <div className="flex gap-2">
                  <Input
                    id="image"
                    placeholder="Image URL"
                    value={newActivity.image}
                    onChange={(e) => setNewActivity({ ...newActivity, image: e.target.value })}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => createFileInput('new')}
                    disabled={uploading['new']}
                    className="px-3"
                  >
                    {uploading['new'] ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {newActivity.image && (
                  <div className="mt-2 relative group w-full h-40">
                    <img
                      src={newActivity.image}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-md border"
                    />
                    <button
                      onClick={() => setNewActivity({ ...newActivity, image: '' })}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
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
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
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


              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Activity Title</label>
                  <input
                    type="text"
                    value={activity.title}
                    onChange={(e) => handleLocalUpdate(index, 'title', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Enter activity title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={activity.description}
                    onChange={(e) => handleLocalUpdate(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter activity description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={activity.image}
                      onChange={(e) => handleLocalUpdate(index, 'image', e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Image URL"
                    />
                    <button
                      type="button"
                      onClick={() => createFileInput(index)}
                      disabled={uploading[activity._id || `idx-${index}`]}
                      className={`px-4 py-2.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2 ${uploading[activity._id || `idx-${index}`] ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {uploading[activity._id || `idx-${index}`] ? (
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      Browse
                    </button>
                  </div>
                  {activity.image && (
                    <div className="mt-2">
                      <img
                        src={activity.image}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
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
