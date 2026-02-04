import { Compass, Plus, Trash2, Save, Upload, ImageIcon, LayoutTemplate } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchExcursions, addExcursion, updateExcursion, fetchExcursionFilters } from '../../../services/excursionApi';
import { uploadToCloudinary } from "../../../services/cloudinaryApi";
import { toast } from "sonner";
import { Autocomplete } from '../ui/autocomplete';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import type { ExcursionData, ExcursionItem, ExcursionHero } from '../../App';

interface ExcursionsSectionProps {
  data: ExcursionData | null;
  onChange: (data: ExcursionData) => void;
}

const INITIAL_HERO: ExcursionHero = {
  heroImage: '',
  title: 'Excursions',
  subtitle: 'Explore our excursions',
  description: 'Discover the best day trips and activities.'
};

const INITIAL_DATA: ExcursionData = {
  excursionHeroes: [INITIAL_HERO],
  excursion: []
};

export function ExcursionsSection({ data: _initialData, onChange: _onChange }: ExcursionsSectionProps) {
  const [formData, setFormData] = useState<ExcursionData>(INITIAL_DATA);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    categories: [],
    destinations: [],
    times: []
  });

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExcursion, setNewExcursion] = useState<ExcursionItem>({
    title: '',
    description: '',
    image: '',
    category: '',
    time: '',
    destination: ''
  });

  // Uploading States
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingNew, setUploadingNew] = useState(false);
  const [uploadingItems, setUploadingItems] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    loadExcursions();
    loadFilters();
  }, []);

  const loadExcursions = async () => {
    try {
      setLoading(true);
      const data = await fetchExcursions();
      if (data) {
        if (!data.excursionHeroes || data.excursionHeroes.length === 0) {
          data.excursionHeroes = [INITIAL_HERO];
        }
        setFormData(data);
        if (_onChange) _onChange(data);
      }
    } catch (error) {
      console.error('Failed to load excursions', error);
      toast.error('Failed to load Excursions data');
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
      console.error('Failed to load filters', error);
    }
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      let result;
      const dataToSave = { ...formData };
      if (!dataToSave.excursionHeroes || dataToSave.excursionHeroes.length === 0) {
        dataToSave.excursionHeroes = [INITIAL_HERO];
      }

      if (formData._id) {
        result = await updateExcursion(formData._id, dataToSave);
      } else {
        result = await addExcursion(dataToSave);
      }
      setFormData(result);
      if (_onChange) _onChange(result);
      toast.success('Changes saved successfully!');
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const updateHeroField = (field: keyof ExcursionHero, value: string) => {
    setFormData(prev => {
      const heroes = [...prev.excursionHeroes];
      if (heroes.length === 0) heroes.push({ ...INITIAL_HERO });
      heroes[0] = { ...heroes[0], [field]: value };
      return { ...prev, excursionHeroes: heroes };
    });
  };

  const handleHeroImageUpload = async (file: File) => {
    setUploadingHero(true);
    try {
      const url = await uploadToCloudinary(file);
      updateHeroField('heroImage', url);
      toast.success('Hero image uploaded');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingHero(false);
    }
  };

  const handleNewItemUpload = async (file: File) => {
    setUploadingNew(true);
    try {
      const url = await uploadToCloudinary(file);
      setNewExcursion(prev => ({ ...prev, image: url }));
      toast.success('Image uploaded');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingNew(false);
    }
  };

  const handleUpdateItemImage = async (index: number, file: File) => {
    setUploadingItems(prev => ({ ...prev, [index]: true }));
    try {
      const url = await uploadToCloudinary(file);
      const updatedList = [...formData.excursion];
      updatedList[index] = { ...updatedList[index], image: url };
      setFormData(prev => ({ ...prev, excursion: updatedList }));
      toast.success('Image updated');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingItems(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleAddExcursion = () => {
    if (!newExcursion.title) {
      toast.error('Title is required');
      return;
    }
    const updatedList = [...formData.excursion, newExcursion];
    setFormData(prev => ({ ...prev, excursion: updatedList }));
    setNewExcursion({ title: '', description: '', image: '', category: '', time: '', destination: '' });
    setIsDialogOpen(false);
    toast.success('Excursion added to list (Remember to Save Changes)');
  };

  const handleRemoveExcursion = (index: number) => {
    if (confirm('Are you sure you want to remove this excursion?')) {
      const updatedList = formData.excursion.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, excursion: updatedList }));
    }
  };

  const handleUpdateExcursionLocal = (index: number, field: keyof ExcursionItem, value: string) => {
    const updatedList = [...formData.excursion];
    updatedList[index] = { ...updatedList[index], [field]: value };
    setFormData(prev => ({ ...prev, excursion: updatedList }));
  };

  const triggerFileInput = (callback: (file: File) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files[0]) {
        callback(files[0]);
      }
    };
    input.click();
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Excursions content...</div>;
  }

  const currentHero = formData.excursionHeroes[0] || INITIAL_HERO;

  return (
    <div className="space-y-8 pb-10">
      <div className="sticky top-0 bg-gray-50/90 dark:bg-gray-900/90 py-4 z-10 border-b border-gray-200 dark:border-gray-700 -mx-4 lg:-mx-8 px-4 lg:px-8 backdrop-blur-sm transition-colors duration-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Excursions Page</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage hero section and excursion activities</p>
          </div>
          <Button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white gap-2 shadow-md transition-all active:scale-95"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
          <LayoutTemplate className="w-5 h-5 text-green-600" />
          <h4 className="font-semibold text-gray-900">Hero Section</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="hero-title">Page Title</Label>
              <Input
                id="hero-title"
                value={currentHero.title}
                onChange={(e) => updateHeroField('title', e.target.value)}
                placeholder="e.g. Excursions"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hero-subtitle">Subtitle</Label>
              <Input
                id="hero-subtitle"
                value={currentHero.subtitle}
                onChange={(e) => updateHeroField('subtitle', e.target.value)}
                placeholder="e.g. Explore our activities"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hero-desc">Description</Label>
              <Textarea
                id="hero-desc"
                value={currentHero.description}
                onChange={(e) => updateHeroField('description', e.target.value)}
                placeholder="Section description..."
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hero Image</Label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center min-h-[200px] relative bg-gray-50 group">
              {currentHero.heroImage ? (
                <div className="relative w-full h-48">
                  <img
                    src={currentHero.heroImage}
                    alt="Hero"
                    className="w-full h-full object-cover rounded-md"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => triggerFileInput(handleHeroImageUpload)}
                      disabled={uploadingHero}
                    >
                      Change Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">No hero image selected</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => triggerFileInput(handleHeroImageUpload)}
                    disabled={uploadingHero}
                  >
                    {uploadingHero ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activities List Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Excursions List</h3>
            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {formData.excursion.length} Items
            </span>
          </div>

          {/* POPUP BOX */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Excursion
              </Button>
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
                    value={newExcursion.title}
                    onChange={(e) => setNewExcursion(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter excursion description"
                    value={newExcursion.description}
                    onChange={(e) => setNewExcursion(prev => ({ ...prev, description: e.target.value }))}
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
                      value={newExcursion.category}
                      onChange={(value) => setNewExcursion(prev => ({ ...prev, category: value }))}
                      options={filters.categories}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Autocomplete
                      id="destination"
                      placeholder="e.g., Sigiriya"
                      value={newExcursion.destination}
                      onChange={(value) => setNewExcursion(prev => ({ ...prev, destination: value }))}
                      options={filters.destinations}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time">Time</Label>
                    <Autocomplete
                      id="time"
                      placeholder="e.g., 5 Hours"
                      value={newExcursion.time}
                      onChange={(value) => setNewExcursion(prev => ({ ...prev, time: value }))}
                      options={filters.times}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="image">Image</Label>
                  <div className="flex gap-2">
                    <Input
                      id="image"
                      placeholder="Image URL"
                      value={newExcursion.image}
                      readOnly
                      className="bg-gray-50"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => triggerFileInput(handleNewItemUpload)}
                      disabled={uploadingNew}
                    >
                      {uploadingNew ? '...' : <Upload className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsDialogOpen(false)} variant="outline" type="button">
                  Cancel
                </Button>
                <Button onClick={handleAddExcursion} type="button">
                  Add Excursion
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {formData.excursion.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            No excursions found. Add one to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {formData.excursion.map((excursion, index) => (
              <div key={excursion._id || index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">Excursion {index + 1}</h4>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRemoveExcursion(index)}
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
                      onChange={(e) => handleUpdateExcursionLocal(index, 'title', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Enter excursion title"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={excursion.description}
                      onChange={(e) => handleUpdateExcursionLocal(index, 'description', e.target.value)}
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
                        onChange={(value) => handleUpdateExcursionLocal(index, 'category', value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="e.g., Adventure"
                        options={filters.categories}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                      <Autocomplete
                        value={excursion.destination}
                        onChange={(value) => handleUpdateExcursionLocal(index, 'destination', value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="e.g., Sigiriya"
                        options={filters.destinations}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <Autocomplete
                        value={excursion.time}
                        onChange={(value) => handleUpdateExcursionLocal(index, 'time', value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="e.g., 5 Hours"
                        options={filters.times}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={excursion.image}
                        readOnly
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
                        placeholder="Image URL"
                      />
                      <Button
                        variant="secondary"
                        onClick={() => triggerFileInput((f) => handleUpdateItemImage(index, f))}
                        disabled={uploadingItems[index]}
                      >
                        {uploadingItems[index] ? '...' : <Upload className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-gray-600 text-sm mb-1 font-medium">Image Preview:</p>
                    {excursion.image ? (
                      <img
                        src={excursion.image}
                        alt={excursion.title}
                        className="w-full h-48 object-cover rounded-lg mt-1"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
