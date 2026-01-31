import { Compass, Plus, Trash2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchExcursions, addExcursion, deleteExcursion, updateExcursion, fetchExcursionFilters } from '../../../services/excursionApi';
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
      setExcursions(data);
    } catch (error) {
      console.error('Failed to load excursions', error);
    } finally {
      setLoading(false);
    }
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
      await addExcursion(formData);
      setIsDialogOpen(false);
      setFormData({ title: '', description: '', image: '', category: '', time: '', destination: '' });
      loadExcursions();
    } catch (error) {
      console.error('Failed to add excursion', error);
    }
  };

  const handleLocalUpdate = (index: number, field: keyof Excursion, value: string) => {
    const updatedExcursions = [...excursions];
    updatedExcursions[index] = { ...updatedExcursions[index], [field]: value };
    setExcursions(updatedExcursions);
  };

  const handleSaveExcursion = async (excursion: Excursion) => {
    try {
      await updateExcursion(excursion._id, excursion);
      alert('Excursion updated successfully!');
    } catch (error) {
      console.error('Failed to update excursion', error);
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
                <Input
                  id="image"
                  placeholder="https://example.com/excursion-image.jpg"
                  value={formData.image}
                  onChange={handleInputChange}
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
            <div key={excursion._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-gray-900">Excursion {index + 1}</h4>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveExcursion(excursion)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                    title="Save changes"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(excursion._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Remove excursion"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Excursion Title</label>
                  <input
                    type="text"
                    value={excursion.title}
                    onChange={(e) => handleLocalUpdate(index, 'title', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Enter excursion title"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={excursion.description}
                    onChange={(e) => handleLocalUpdate(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter excursion description"
                  />
                </div>
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <Autocomplete
                      value={excursion.category}
                      onChange={(value) => handleLocalUpdate(index, 'category', value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="e.g., Adventure"
                      options={filters.categories}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                    <Autocomplete
                      value={excursion.destination}
                      onChange={(value) => handleLocalUpdate(index, 'destination', value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="e.g., Sigiriya"
                      options={filters.destinations}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time/Duration</label>
                    <Autocomplete
                      value={excursion.time}
                      onChange={(value) => handleLocalUpdate(index, 'time', value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="e.g., 5 Hours"
                      options={filters.times}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    type="text"
                    value={excursion.image}
                    onChange={(e) => handleLocalUpdate(index, 'image', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="https://example.com/excursion-image.jpg"
                  />
                </div>

                <div className="md:col-span-2">
                  <p className="text-gray-600 text-sm mb-1 font-medium">Image Preview:</p>
                  {excursion.image && (
                    <img
                      src={excursion.image}
                      alt={excursion.title}
                      className="w-full h-48 object-cover rounded-lg mt-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
          {excursions.length === 0 && (
            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              No excursions found. Add one to get started.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
