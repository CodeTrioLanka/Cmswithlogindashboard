// ... imports
import { useState, useEffect } from 'react';
import { Activity, Plus, Trash2, Save, ImageIcon, LayoutTemplate, Edit, X } from 'lucide-react';
import { deleteFromCloudinary } from "../../../services/deleteApi";
import { ImageUploadInput } from '../ui/ImageUploadInput';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { getThingsToDo, createThingsToDo, updateThingsToDo } from '../../../services/thingsToDoService';
import type { ThingsToDoData, ThingsToDoItem, ThingsToDoHero } from '../../App';

interface ThingsToDoSectionProps {
  data: ThingsToDoData | null;
  onChange: (data: ThingsToDoData) => void;
}

const INITIAL_HERO: ThingsToDoHero = {
  heroImage: '',
  title: 'Things To Do',
  subtitle: 'Explore our activities',
  description: 'Discover the best things to do in nature.'
};

const INITIAL_DATA: ThingsToDoData = {
  thingsToDoHeroes: [INITIAL_HERO],
  thingsToDo: []
};

export function ThingsToDoSection({ data: _initialData, onChange: _onChange }: ThingsToDoSectionProps) {
  const [formData, setFormData] = useState<ThingsToDoData>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState<ThingsToDoData | null>(null);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newActivity, setNewActivity] = useState<ThingsToDoItem>({
    title: '',
    description: '',
    image: ''
  });



  useEffect(() => {
    loadData();
  }, []);

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
    const currentHero = formData.thingsToDoHeroes[0] || INITIAL_HERO;
    const oldUrl = currentHero.heroImage;
    if (oldUrl && oldUrl !== url) handleDeleteImage(oldUrl);
    updateHeroField('heroImage', url);
  };

  const handleNewActivityImageUpdate = (url: string) => {
    const oldUrl = newActivity.image;
    if (oldUrl && oldUrl !== url) handleDeleteImage(oldUrl);
    setNewActivity(prev => ({ ...prev, image: url }));
  };

  const handleActivityImageUpdate = (index: number, url: string) => {
    const oldUrl = formData.thingsToDo[index].image;
    if (oldUrl && oldUrl !== url) handleDeleteImage(oldUrl);

    const updatedList = [...formData.thingsToDo];
    updatedList[index] = { ...updatedList[index], image: url };
    setFormData(prev => ({ ...prev, thingsToDo: updatedList }));
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await getThingsToDo();
      if (data) {
        // Ensure heroes array has at least one item
        if (!data.thingsToDoHeroes || data.thingsToDoHeroes.length === 0) {
          data.thingsToDoHeroes = [INITIAL_HERO];
        }
        setFormData(data);
        setOriginalData(data);
        if (_onChange) _onChange(data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load Things To Do data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (originalData) {
      setFormData(originalData);
    }
    setIsEditing(false);
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      let result;
      // Ensure we have a valid structure before saving
      const dataToSave = { ...formData };
      if (!dataToSave.thingsToDoHeroes || dataToSave.thingsToDoHeroes.length === 0) {
        dataToSave.thingsToDoHeroes = [INITIAL_HERO];
      }

      if (formData._id) {
        result = await updateThingsToDo(formData._id, dataToSave);
      } else {
        result = await createThingsToDo(dataToSave);
      }

      setFormData(result);
      setOriginalData(result);
      if (_onChange) _onChange(result);

      setIsEditing(false);
      // Use logic to safely access message if it exists on result, though service might return data directly
      // Adjusting to generic message + fallback if service returns object with message
      const message = (result as any)?.message || 'Changes saved successfully!';
      toast.success(message);
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const updateHeroField = (field: keyof ThingsToDoHero, value: string) => {
    setFormData(prev => {
      const heroes = [...prev.thingsToDoHeroes];
      if (heroes.length === 0) heroes.push({ ...INITIAL_HERO });
      heroes[0] = { ...heroes[0], [field]: value };
      return { ...prev, thingsToDoHeroes: heroes };
    });
  };



  const handleAddActivity = () => {
    if (!newActivity.title) {
      toast.error('Title is required');
      return;
    }
    const updatedList = [...formData.thingsToDo, newActivity];
    setFormData(prev => ({ ...prev, thingsToDo: updatedList }));
    setNewActivity({ title: '', description: '', image: '' });
    setIsDialogOpen(false);
    toast.success('Activity added to list (Remember to Save Changes)');
  };

  const handleRemoveActivity = (index: number) => {
    if (confirm('Are you sure you want to remove this activity?')) {
      const updatedList = formData.thingsToDo.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, thingsToDo: updatedList }));
    }
  };

  const handleUpdateActivity = (index: number, field: keyof ThingsToDoItem, value: string) => {
    const updatedList = [...formData.thingsToDo];
    updatedList[index] = { ...updatedList[index], [field]: value };
    setFormData(prev => ({ ...prev, thingsToDo: updatedList }));
  };



  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading Things To Do content...</div>;
  }

  const currentHero = formData.thingsToDoHeroes[0] || INITIAL_HERO;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center sticky top-0 bg-gray-50 py-4 z-10 border-b border-gray-200 -mx-8 px-8 backdrop-blur-sm bg-opacity-90">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Things To Do Page</h3>
          <p className="text-sm text-gray-600">Manage hero section and activities list</p>
        </div>
        <div className="flex gap-2">
          {isEditing && (
            <Button
              onClick={handleCancel}
              disabled={isSaving}
              variant="secondary"
              className="bg-gray-500 hover:bg-gray-600 text-white gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          )}
          <Button
            onClick={isEditing ? handleSaveAll : () => setIsEditing(true)}
            disabled={isSaving}
            className={`${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white gap-2`}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                Edit
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
                placeholder="e.g. Things To Do"
                readOnly={!isEditing}
                className={!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hero-subtitle">Subtitle</Label>
              <Input
                id="hero-subtitle"
                value={currentHero.subtitle}
                onChange={(e) => updateHeroField('subtitle', e.target.value)}
                placeholder="e.g. Discover our activities"
                readOnly={!isEditing}
                className={!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}
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
                readOnly={!isEditing}
                className={!isEditing ? 'bg-gray-50 cursor-not-allowed resize-none' : 'resize-none'}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hero Image</Label>
            <ImageUploadInput
              value={currentHero.heroImage}
              onChange={handleHeroImageUpdate}
              placeholder="Hero Image URL"
              disabled={!isEditing}
            />
            {currentHero.heroImage && (
              <div className="mt-2 w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={currentHero.heroImage}
                  alt="Hero"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activities List Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Activities List</h3>
            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {formData.thingsToDo.length} Items
            </span>
          </div>

          {/* POPUP BOX */}
          {isEditing && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Activity
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Activity</DialogTitle>
                  <DialogDescription>Add a new item to the Things To Do list.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid gap-2">
                    <Label>Title</Label>
                    <Input
                      value={newActivity.title}
                      onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                      placeholder="Activity Title"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newActivity.description}
                      onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                      placeholder="Activity Description"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Image</Label>
                    <ImageUploadInput
                      value={newActivity.image}
                      onChange={handleNewActivityImageUpdate}
                      placeholder="Activity Image URL"
                    />
                    {newActivity.image && (
                      <div className="mt-2 h-32 rounded-lg overflow-hidden border border-gray-200">
                        <img src={newActivity.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddActivity}>Add Activity</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {formData.thingsToDo.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <Activity className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No activities found</p>
            <p className="text-sm text-gray-400">Add your first activity to get started</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {formData.thingsToDo.map((item, index) => (
              <div key={item._id || index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition-all hover:shadow-md">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Image Column */}
                  <div className="w-full md:w-72 flex-shrink-0">
                    <div className="space-y-2">
                      <ImageUploadInput
                        value={item.image}
                        onChange={(url) => handleActivityImageUpdate(index, url)}
                        placeholder="Image URL"
                        disabled={!isEditing}
                      />
                      {item.image ? (
                        <div className="rounded-lg overflow-hidden h-40 bg-gray-100 border border-gray-200">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-40 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Column */}
                  <div className="flex-1 space-y-4">
                    <div className="grid gap-2">
                      <Label className="text-xs text-gray-500 uppercase tracking-wide">Title</Label>
                      <Input
                        value={item.title}
                        onChange={(e) => handleUpdateActivity(index, 'title', e.target.value)}
                        className={`font-medium ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        readOnly={!isEditing}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs text-gray-500 uppercase tracking-wide">Description</Label>
                      <Textarea
                        value={item.description}
                        onChange={(e) => handleUpdateActivity(index, 'description', e.target.value)}
                        rows={2}
                        className={`text-sm text-gray-600 min-h-[80px] ${!isEditing ? 'bg-gray-50 cursor-not-allowed resize-none' : 'resize-none'}`}
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>

                  {/* Actions Column */}
                  {isEditing && (
                    <div className="flex flex-col gap-2 justify-start border-l border-gray-100 pl-4 md:pl-6">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleRemoveActivity(index)}
                      >
                        <Trash2 className="w-4 h-4" />
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
