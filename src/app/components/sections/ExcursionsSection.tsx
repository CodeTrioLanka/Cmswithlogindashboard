import { Compass, Plus, Trash2, Save, ImageIcon, LayoutTemplate, Edit, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchExcursions, addExcursion, updateExcursion, fetchExcursionFilters } from '../../../services/excursionApi';
import { deleteFromCloudinary } from "../../../services/deleteApi";
import { toast } from "sonner";
import { Autocomplete } from '../ui/autocomplete';
import { ImageUploadInput } from '../ui/ImageUploadInput';
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
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState<ExcursionData | null>(null);

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadExcursions(), loadFilters()]);
    setLoading(false);
  };

  const loadExcursions = async () => {
    try {
      const data = await fetchExcursions();
      if (data) {
        if (!data.excursionHeroes || data.excursionHeroes.length === 0) {
          data.excursionHeroes = [INITIAL_HERO];
        }
        setFormData(data);
        setOriginalData(JSON.parse(JSON.stringify(data))); // Deep copy
        if (_onChange) _onChange(data);
      } else {
        setOriginalData(INITIAL_DATA);
      }
    } catch (error) {
      console.error('Failed to load excursions', error);
      toast.error('Failed to load Excursions data');
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

  const handleDeleteImage = async (url: string) => {
    if (url && url.includes('cloudinary')) {
      try {
        await deleteFromCloudinary(url);
      } catch (error) {
        console.error('Failed to delete image:', error);
      }
    }
  };

  const handleHeroImageUpdate = (url: string) => {
    const currentHero = formData.excursionHeroes[0] || INITIAL_HERO;
    const oldUrl = currentHero.heroImage;

    if (oldUrl && oldUrl !== url && oldUrl.includes('cloudinary')) {
      handleDeleteImage(oldUrl);
    }

    updateHeroField('heroImage', url);
  };

  const handleNewItemImageUpdate = (url: string) => {
    const oldUrl = newExcursion.image;
    if (oldUrl && oldUrl !== url && oldUrl.includes('cloudinary')) {
      handleDeleteImage(oldUrl);
    }
    setNewExcursion(prev => ({ ...prev, image: url }));
  };

  const handleUpdateItemImage = (index: number, url: string) => {
    const oldUrl = formData.excursion[index].image;
    if (oldUrl && oldUrl !== url && oldUrl.includes('cloudinary')) {
      handleDeleteImage(oldUrl);
    }

    const updatedList = [...formData.excursion];
    updatedList[index] = { ...updatedList[index], image: url };
    setFormData(prev => ({ ...prev, excursion: updatedList }));
  };

  const handleCancel = () => {
    if (originalData) {
      setFormData(JSON.parse(JSON.stringify(originalData))); // Restore
    }
    setIsEditing(false);
    toast.info('Changes discarded');
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
      setOriginalData(JSON.parse(JSON.stringify(result)));
      if (_onChange) _onChange(result);

      setIsEditing(false);
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
      const itemToRemove = formData.excursion[index];
      if (itemToRemove.image) handleDeleteImage(itemToRemove.image);

      const updatedList = formData.excursion.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, excursion: updatedList }));
    }
  };

  const handleUpdateExcursionLocal = (index: number, field: keyof ExcursionItem, value: string) => {
    const updatedList = [...formData.excursion];
    updatedList[index] = { ...updatedList[index], [field]: value };
    setFormData(prev => ({ ...prev, excursion: updatedList }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400">Loading Excursions content...</p>
      </div>
    );
  }

  const currentHero = formData.excursionHeroes[0] || INITIAL_HERO;

  return (
    <div className="space-y-8 pb-20">
      {/* Header / Actions Bar */}
      <div className="flex justify-between items-center sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md py-4 z-20 border-b border-gray-200 dark:border-gray-800 -mx-6 px-6 shadow-sm">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-green-600" />
            Excursions
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage hero section and excursion activities</p>
        </div>
        <div className="flex gap-3">

          {isEditing ? (
            <>
              <Button
                onClick={handleCancel}
                disabled={isSaving}
                variant="destructive"
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveAll}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 text-white gap-2 min-w-[120px]"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Content
            </Button>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <LayoutTemplate className="w-5 h-5 text-green-600" />
          <h4 className="font-semibold text-gray-900 dark:text-white">Hero Section Configuration</h4>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="hero-title" className="text-gray-700 dark:text-gray-300">Page Title</Label>
              <Input
                id="hero-title"
                value={currentHero.title}
                onChange={(e) => updateHeroField('title', e.target.value)}
                placeholder="e.g. Excursions"
                disabled={!isEditing}
                className="font-semibold text-lg"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hero-subtitle" className="text-gray-700 dark:text-gray-300">Subtitle</Label>
              <Input
                id="hero-subtitle"
                value={currentHero.subtitle}
                onChange={(e) => updateHeroField('subtitle', e.target.value)}
                placeholder="e.g. Explore our activities"
                disabled={!isEditing}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hero-desc" className="text-gray-700 dark:text-gray-300">Description</Label>
              <Textarea
                id="hero-desc"
                value={currentHero.description}
                onChange={(e) => updateHeroField('description', e.target.value)}
                placeholder="Section description..."
                rows={4}
                disabled={!isEditing}
                className="resize-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-gray-700 dark:text-gray-300">Hero Background Image</Label>
            <div className={`border-2 border-dashed rounded-xl p-4 transition-colors ${isEditing ? 'border-gray-300 hover:border-blue-400 bg-gray-50' : 'border-gray-200'}`}>
              {currentHero.heroImage ? (
                <div className="space-y-3">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-sm">
                    <img
                      src={currentHero.heroImage}
                      alt="Hero"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={currentHero.heroImage}
                      readOnly
                      className="text-xs text-gray-500 bg-white"
                    />
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => handleHeroImageUpdate('')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-gray-400 gap-2">
                  <ImageIcon className="w-10 h-10 opacity-50" />
                  <span className="text-sm">No image selected</span>
                </div>
              )}

              {isEditing && (
                <div className="mt-4">
                  <ImageUploadInput
                    value={currentHero.heroImage}
                    onChange={handleHeroImageUpdate}
                    placeholder="Paste URL or Upload New Image"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activities List Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Excursions List</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-sm font-semibold">
              {formData.excursion.length}
            </span>
          </div>

          {/* POPUP BOX */}
          {isEditing && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
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
                    <Label htmlFor="title">Excursion Title <span className="text-red-500">*</span></Label>
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
                    <Label>Image</Label>
                    <ImageUploadInput
                      value={newExcursion.image}
                      onChange={handleNewItemImageUpdate}
                      placeholder="Upload or paste image URL"
                    />
                    {newExcursion.image && (
                      <div className="mt-2 relative rounded-lg overflow-hidden border border-gray-200 h-40">
                        <img
                          src={newExcursion.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setIsDialogOpen(false)} variant="outline" type="button">
                    Cancel
                  </Button>
                  <Button onClick={handleAddExcursion} type="button" className="bg-green-600 text-white hover:bg-green-700">
                    Add Excursion
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {formData.excursion.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Compass className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">No Excursions Yet</h4>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm text-center mt-1">
              Get started by clicking the "Edit Content" button and adding your first excursion.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {formData.excursion.map((item, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all p-6 relative"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image Area */}
                  <div className="w-full md:w-64 flex-shrink-0 space-y-3">
                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 relative">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-10 h-10 opacity-50" />
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <ImageUploadInput
                        value={item.image}
                        onChange={(url) => handleUpdateItemImage(index, url)}
                        placeholder="Change Image URL"
                        className="text-xs"
                      />
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</Label>
                      <Input
                        value={item.title}
                        onChange={(e) => handleUpdateExcursionLocal(index, 'title', e.target.value)}
                        disabled={!isEditing}
                        className={`text-lg font-semibold ${!isEditing && 'border-transparent px-0 shadow-none'}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</Label>
                      <Textarea
                        value={item.description}
                        onChange={(e) => handleUpdateExcursionLocal(index, 'description', e.target.value)}
                        disabled={!isEditing}
                        rows={3}
                        className={`resize-none ${!isEditing && 'border-transparent px-0 shadow-none bg-transparent'}`}
                      />
                    </div>

                    {/* Extra Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</Label>
                        {isEditing ? (
                          <Autocomplete
                            value={item.category}
                            onChange={(value) => handleUpdateExcursionLocal(index, 'category', value)}
                            options={filters.categories}
                            className="h-9"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-200 py-1">{item.category || '-'}</div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Destination</Label>
                        {isEditing ? (
                          <Autocomplete
                            value={item.destination}
                            onChange={(value) => handleUpdateExcursionLocal(index, 'destination', value)}
                            options={filters.destinations}
                            className="h-9"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-200 py-1">{item.destination || '-'}</div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</Label>
                        {isEditing ? (
                          <Autocomplete
                            value={item.time}
                            onChange={(value) => handleUpdateExcursionLocal(index, 'time', value)}
                            options={filters.times}
                            className="h-9"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-200 py-1">{item.time || '-'}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Area */}
                  {isEditing && (
                    <div className="absolute top-4 right-4 md:static md:flex md:flex-col md:justify-start">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                        onClick={() => handleRemoveExcursion(index)}
                        title="Remove Excursion"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
