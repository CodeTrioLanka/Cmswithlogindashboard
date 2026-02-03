import { Compass, Plus, Trash2, Save, Edit, X } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUploadInput } from '../ui/ImageUploadInput';
import { useEffect, useState } from 'react';
import { fetchExcursions, addExcursion, deleteExcursion, updateExcursion, fetchExcursionFilters } from '../../../services/excursionApi';
import { deleteFromCloudinary } from '../../../services/deleteApi';
import { Autocomplete } from '../ui/autocomplete';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';


interface Excursion {
  _id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  time: string;
  destination: string;
  slug?: string;
}

export function ExcursionsSection() {
  const [excursions, setExcursions] = useState<Excursion[]>([]);
  const [editingIds, setEditingIds] = useState<Set<string>>(new Set());
  const [originalData, setOriginalData] = useState<{ [key: string]: Excursion }>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    category: '',
    time: '',
    destination: ''
  });
  const [filters, setFilters] = useState({
    categories: [],
    destinations: [],
    times: []
  });

  useEffect(() => {
    loadExcursions();
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const data = await fetchExcursionFilters();
      setFilters({
        categories: data.category || [],
        destinations: data.destination || [],
        times: data.time || []
      });
    } catch (error) {
      console.error('Failed to load filters', error);
    }
  };

  const loadExcursions = async () => {
    try {
      const data = await fetchExcursions();
      console.log('🔍 Raw excursions data:', data);
      console.log('🔍 Data type:', typeof data);
      console.log('🔍 Is Array?:', Array.isArray(data));

      let list: Excursion[] = [];

      // Handle the actual backend structure: [{excursion: [...]}]
      if (Array.isArray(data) && data.length > 0 && data[0].excursion && Array.isArray(data[0].excursion)) {
        console.log('✅ Data is in array[0].excursion property');
        list = data[0].excursion;
      } else if (Array.isArray(data)) {
        console.log('✅ Data is direct array');
        list = data;
      } else if (data && Array.isArray(data.data)) {
        console.log('✅ Data is in data.data property');
        list = data.data;
      } else if (data && Array.isArray(data.excursions)) {
        console.log('✅ Data is in data.excursions property');
        list = data.excursions;
      } else if (data && Array.isArray(data.excursion)) {
        console.log('✅ Data is in data.excursion property');
        list = data.excursion;
      } else if (data && data.data && Array.isArray(data.data.excursions)) {
        console.log('✅ Data is in data.data.excursions property');
        list = data.data.excursions;
      } else {
        console.log('❌ Could not find array in response. Data structure:', Object.keys(data || {}));
      }

      console.log('🎯 Final processed list:', list);
      console.log('🎯 List length:', list.length);
      setExcursions(list);
      console.log('✅ State updated with', list.length, 'excursions');
    } catch (error) {
      console.error('❌ Failed to load excursions', error);
    } finally {
      setLoading(false);
      console.log('✅ Loading set to false');
    }
  };

  const handleDeleteImage = async (url: string) => {
    if (url && url.includes('cloudinary')) {
      try {
        await deleteFromCloudinary(url);
      } catch (error) {
        console.error('Failed to delete image:', error);
      }
    }
  };

  const handleNewImageUpdate = (url: string) => {
    const oldUrl = formData.image;
    if (oldUrl && oldUrl !== url) handleDeleteImage(oldUrl);
    setFormData(prev => ({ ...prev, image: url }));
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this excursion?')) {
      try {
        await deleteExcursion(id);
        loadExcursions();
      } catch (error) {
        console.error('Failed to delete excursion', error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };



  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await addExcursion(formData);
      console.log('Add excursion response:', response);

      setIsDialogOpen(false);
      setFormData({ title: '', description: '', image: '', category: '', time: '', destination: '' });
      await loadExcursions(); // Refresh properties
      toast.success(response?.message || 'Excursion added successfully!');
    } catch (error) {
      console.error('Failed to add excursion', error);
      toast.error('Failed to add excursion');
      setLoading(false); // Reset loading on error
    }
  };

  const handleEditClick = (excursion: Excursion) => {
    setOriginalData(prev => ({ ...prev, [excursion._id]: { ...excursion } }));
    setEditingIds(prev => new Set(prev).add(excursion._id));
  };

  const handleCancelEdit = (id: string) => {
    if (originalData[id]) {
      const updatedExcursions = excursions.map(exc =>
        exc._id === id ? originalData[id] : exc
      );
      setExcursions(updatedExcursions);
    }
    setEditingIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleLocalUpdate = (index: number, field: keyof Excursion, value: string) => {
    const updatedExcursions = [...excursions];

    if (field === 'image') {
      const oldUrl = updatedExcursions[index].image;
      if (oldUrl && oldUrl !== value) handleDeleteImage(oldUrl);
    }

    updatedExcursions[index] = { ...updatedExcursions[index], [field]: value };
    setExcursions(updatedExcursions);
  };

  const handleSaveExcursion = async (excursion: Excursion) => {
    try {
      const result = await updateExcursion(excursion._id, excursion);
      toast.success(result?.message || 'Excursion updated successfully!');
      setEditingIds(prev => {
        const next = new Set(prev);
        next.delete(excursion._id);
        return next;
      });
    } catch (error) {
      console.error('Failed to update excursion', error);
      toast.error('Failed to update excursion');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Excursions</h3>
          <p className="text-sm text-gray-600 mt-1">Manage day trips and excursion activities</p>
        </div>

        {/* POPUP BOX */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md font-medium">
              <Plus className="w-4 h-4" />
              Add Excursion
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Excursion</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new excursion.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Excursion Title</Label>
                <Input
                  id="title"
                  placeholder="Enter excursion title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter excursion description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Autocomplete
                    id="category"
                    placeholder="e.g., Adventure"
                    value={formData.category}
                    onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    options={filters.categories}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Autocomplete
                    id="destination"
                    placeholder="e.g., Sigiriya"
                    value={formData.destination}
                    onChange={(value) => setFormData(prev => ({ ...prev, destination: value }))}
                    options={filters.destinations}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Time/Duration</Label>
                  <Autocomplete
                    id="time"
                    placeholder="e.g., 5 Hours"
                    value={formData.time}
                    onChange={(value) => setFormData(prev => ({ ...prev, time: value }))}
                    options={filters.times}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="image">Image URL</Label>
                <ImageUploadInput
                  value={formData.image}
                  onChange={handleNewImageUpdate}
                  placeholder="https://example.com/excursion-image.jpg"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsDialogOpen(false)} variant="outline" type="button">
                Cancel
              </Button>
              <Button onClick={handleSubmit} type="submit">
                Save Excursion
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading excursions...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {excursions.map((excursion, index) => (
            <div key={excursion._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-green-600 dark:text-green-500" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Excursion {index + 1}</h4>
                </div>
                <div className="flex gap-2">
                  {editingIds.has(excursion._id) ? (
                    <>
                      <button
                        onClick={() => handleCancelEdit(excursion._id)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSaveExcursion(excursion)}
                        className="p-2 text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-all"
                        title="Save changes"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEditClick(excursion)}
                      className="p-2 text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(excursion._id)}
                    className="p-2 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                    title="Remove excursion"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Excursion Title</label>
                  <input
                    type="text"
                    value={excursion.title}
                    onChange={(e) => handleLocalUpdate(index, 'title', e.target.value)}
                    readOnly={!editingIds.has(excursion._id)}
                    className={`w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${!editingIds.has(excursion._id) ? 'bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-75' : ''}`}
                    placeholder="Enter excursion title"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    value={excursion.description}
                    onChange={(e) => handleLocalUpdate(index, 'description', e.target.value)}
                    rows={3}
                    readOnly={!editingIds.has(excursion._id)}
                    className={`w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${!editingIds.has(excursion._id) ? 'bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-75' : ''}`}
                    placeholder="Enter excursion description"
                  />
                </div>
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                    <Autocomplete
                      value={excursion.category}
                      onChange={(value) => handleLocalUpdate(index, 'category', value)}
                      readOnly={!editingIds.has(excursion._id)}
                      className={`w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${!editingIds.has(excursion._id) ? 'bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-75' : ''}`}
                      placeholder="e.g., Adventure"
                      options={filters.categories}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Destination</label>
                    <Autocomplete
                      value={excursion.destination}
                      onChange={(value) => handleLocalUpdate(index, 'destination', value)}
                      readOnly={!editingIds.has(excursion._id)}
                      className={`w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${!editingIds.has(excursion._id) ? 'bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-75' : ''}`}
                      placeholder="e.g., Sigiriya"
                      options={filters.destinations}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time/Duration</label>
                    <Autocomplete
                      value={excursion.time}
                      onChange={(value) => handleLocalUpdate(index, 'time', value)}
                      readOnly={!editingIds.has(excursion._id)}
                      className={`w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${!editingIds.has(excursion._id) ? 'bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-75' : ''}`}
                      placeholder="e.g., 5 Hours"
                      options={filters.times}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image URL</label>
                  <ImageUploadInput
                    value={excursion.image}
                    onChange={(url) => handleLocalUpdate(index, 'image', url)}
                    disabled={!editingIds.has(excursion._id)}
                    placeholder="https://example.com/excursion-image.jpg"
                  />
                </div>

                <div className="md:col-span-2">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 font-medium">Image Preview:</p>
                  {excursion.image && (
                    <div className="image-preview-medium mt-1">
                      <img
                        src={excursion.image}
                        alt={excursion.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {excursions.length === 0 && (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              No excursions found. Add one to get started.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
