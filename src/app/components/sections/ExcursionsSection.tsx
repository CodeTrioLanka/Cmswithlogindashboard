import { useState, useEffect } from 'react';
import { Compass, Plus, Trash2, Save, Edit, X, MapPin, Clock, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUploadInput } from '../ui/ImageUploadInput';
import { fetchExcursions, addExcursion, deleteExcursion, updateExcursion, fetchExcursionFilters } from '../../../services/excursionApi';
import { deleteFromCloudinary } from '../../../services/deleteApi';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

// Interface matching Backend Model
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

interface NewExcursion {
  title: string;
  description: string;
  image: string;
  category: string;
  time: string;
  destination: string;
}

export function ExcursionsSection() {
  const [excursions, setExcursions] = useState<Excursion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    categories: [] as string[],
    destinations: [] as string[],
    times: [] as string[]
  });

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExcursion, setNewExcursion] = useState<NewExcursion>({
    title: '',
    description: '',
    image: '',
    category: '',
    time: '',
    destination: ''
  });

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Excursion | null>(null);

  useEffect(() => {
    loadExcursions();
    loadFilters();
  }, []);

  const loadExcursions = async () => {
    try {
      setLoading(true);
      const data = await fetchExcursions();
      console.log('Excursions data:', data);

      let list: Excursion[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.excursions)) {
        list = data.excursions;
      } else if (data && Array.isArray(data.data)) {
        list = data.data;
      }

      setExcursions(list);
    } catch (error) {
      console.error('Failed to load excursions:', error);
      toast.error('Failed to load excursions');
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const data = await fetchExcursionFilters();
      setFilters({
        categories: data.category || [],
        destinations: data.destination || [],
        times: data.time || []
      });
    } catch (error) {
      console.error('Failed to load filters:', error);
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
    const oldUrl = newExcursion.image;
    if (oldUrl && oldUrl !== url) handleDeleteImage(oldUrl);
    setNewExcursion(prev => ({ ...prev, image: url }));
  };

  const handleEditImageUpdate = (url: string) => {
    if (!editForm) return;
    const oldUrl = editForm.image;
    if (oldUrl && oldUrl !== url) handleDeleteImage(oldUrl);
    setEditForm(prev => prev ? ({ ...prev, image: url }) : null);
  };

  const handleCreate = async () => {
    if (!newExcursion.title) {
      toast.error('Title is required');
      return;
    }
    try {
      setLoading(true);
      await addExcursion(newExcursion);
      setNewExcursion({
        title: '',
        description: '',
        image: '',
        category: '',
        time: '',
        destination: ''
      });
      setIsDialogOpen(false);
      await loadExcursions();
      toast.success('Excursion created successfully');
    } catch (error) {
      console.error('Failed to create excursion:', error);
      toast.error('Failed to create excursion');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this excursion?')) return;
    try {
      setLoading(true);
      await deleteExcursion(id);
      await loadExcursions();
      toast.success('Excursion deleted');
    } catch (error) {
      console.error('Failed to delete excursion:', error);
      toast.error('Failed to delete excursion');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (excursion: Excursion) => {
    setEditingId(excursion._id);
    setEditForm({ ...excursion });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = async () => {
    if (!editForm || !editingId) return;
    try {
      setLoading(true);
      await updateExcursion(editingId, editForm);
      setEditingId(null);
      setEditForm(null);
      await loadExcursions();
      toast.success('Excursion updated');
    } catch (error) {
      console.error('Failed to update excursion:', error);
      toast.error('Failed to update excursion');
    } finally {
      setLoading(false);
    }
  };

  const updateEditField = (field: keyof Excursion, value: string) => {
    setEditForm(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  if (loading && excursions.length === 0) {
    return <div className="p-8 text-center text-gray-500">Loading Excursions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Excursions</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage your excursion packages and details</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Excursion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Excursion</DialogTitle>
              <DialogDescription>Fill in the details for the new excursion.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={newExcursion.title}
                  onChange={(e) => setNewExcursion({ ...newExcursion, title: e.target.value })}
                  placeholder="Excursion Title"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={newExcursion.category}
                  onChange={(e) => setNewExcursion({ ...newExcursion, category: e.target.value })}
                  placeholder="e.g. Hiking, Boat Tour"
                  list="categories"
                />
                <datalist id="categories">
                  {filters.categories.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label>Time / Duration</Label>
                <Input
                  value={newExcursion.time}
                  onChange={(e) => setNewExcursion({ ...newExcursion, time: e.target.value })}
                  placeholder="e.g. 2 Days, 5 Hours"
                  list="times"
                />
                <datalist id="times">
                  {filters.times.map(t => <option key={t} value={t} />)}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label>Destination</Label>
                <Input
                  value={newExcursion.destination}
                  onChange={(e) => setNewExcursion({ ...newExcursion, destination: e.target.value })}
                  placeholder="e.g. Kandy, Mirissa"
                  list="destinations"
                />
                <datalist id="destinations">
                  {filters.destinations.map(d => <option key={d} value={d} />)}
                </datalist>
              </div>
              <div className="col-span-1 md:col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newExcursion.description}
                  onChange={(e) => setNewExcursion({ ...newExcursion, description: e.target.value })}
                  placeholder="Detailed description..."
                  rows={3}
                />
              </div>
              <div className="col-span-1 md:col-span-2 space-y-2">
                <Label>Image</Label>
                <ImageUploadInput
                  value={newExcursion.image}
                  onChange={handleNewImageUpdate}
                  placeholder="Image URL"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={loading}>
                {loading ? 'Creating...' : 'Create Excursion'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {excursions.map(excursion => (
          <div key={excursion._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {editingId === excursion._id && editForm ? (
              // EDIT MODE
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2 flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg">Editing Excursion</h3>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={cancelEdit}><X className="w-4 h-4 mr-1" /> Cancel</Button>
                    <Button size="sm" onClick={saveEdit}><Save className="w-4 h-4 mr-1" /> Save</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={editForm.title} onChange={(e) => updateEditField('title', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={editForm.category} onChange={(e) => updateEditField('category', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input value={editForm.time} onChange={(e) => updateEditField('time', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Destination</Label>
                  <Input value={editForm.destination} onChange={(e) => updateEditField('destination', e.target.value)} />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label>Description</Label>
                  <Textarea value={editForm.description} onChange={(e) => updateEditField('description', e.target.value)} rows={3} />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label>Image</Label>
                  <ImageUploadInput value={editForm.image} onChange={handleEditImageUpdate} />
                </div>
              </div>
            ) : (
              // VIEW MODE
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-64 h-48 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  {excursion.image ? (
                    <img src={excursion.image} alt={excursion.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Compass className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{excursion.title}</h3>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {excursion.category && (
                          <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            <Tag className="w-3 h-3 mr-1" />
                            {excursion.category}
                          </span>
                        )}
                        {excursion.time && (
                          <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                            <Clock className="w-3 h-3 mr-1" />
                            {excursion.time}
                          </span>
                        )}
                        {excursion.destination && (
                          <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            <MapPin className="w-3 h-3 mr-1" />
                            {excursion.destination}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(excursion)}>
                        <Edit className="w-4 h-4 text-gray-600" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(excursion._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                    {excursion.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
