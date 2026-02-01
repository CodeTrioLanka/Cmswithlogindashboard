// ... imports
import { useState, useEffect } from 'react';
import { Activity, Plus, Trash2, Save, Upload, ImageIcon, LayoutTemplate } from 'lucide-react';
import { uploadToCloudinary } from "../../../services/cloudinaryApi";
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

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newActivity, setNewActivity] = useState<ThingsToDoItem>({
    title: '',
    description: '',
    image: ''
  });

  // Uploading States
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingNew, setUploadingNew] = useState(false);
  const [uploadingItems, setUploadingItems] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    loadData();
  }, []);

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
        if (_onChange) _onChange(data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load Things To Do data');
    } finally {
      setIsLoading(false);
    }
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
      if (_onChange) _onChange(result);
      toast.success('Changes saved successfully!');
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
      setNewActivity(prev => ({ ...prev, image: url }));
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
      const updatedList = [...formData.thingsToDo];
      updatedList[index] = { ...updatedList[index], image: url };
      setFormData(prev => ({ ...prev, thingsToDo: updatedList }));
      toast.success('Image updated');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingItems(prev => ({ ...prev, [index]: false }));
    }
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
        <Button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700 text-white gap-2"
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
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hero-subtitle">Subtitle</Label>
              <Input
                id="hero-subtitle"
                value={currentHero.subtitle}
                onChange={(e) => updateHeroField('subtitle', e.target.value)}
                placeholder="e.g. Discover our activities"
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
            <Activity className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Activities List</h3>
            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {formData.thingsToDo.length} Items
            </span>
          </div>

          {/* POPUP BOX */}
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
                  <div className="flex gap-2">
                    <Input
                      value={newActivity.image}
                      placeholder="Image URL"
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
                <Button onClick={handleAddActivity}>Add Activity</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image Column */}
                  <div className="w-full md:w-72 flex-shrink-0">
                    <div className="relative group rounded-lg overflow-hidden h-48 md:h-56 bg-gray-100 border border-gray-200">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => triggerFileInput((f) => handleUpdateItemImage(index, f))}
                          disabled={uploadingItems[index]}
                        >
                          <Upload className="w-3 h-3 mr-1" />
                          Change
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Content Column */}
                  <div className="flex-1 space-y-4">
                    <div className="grid gap-2">
                      <Label className="text-xs text-gray-500 uppercase tracking-wide">Title</Label>
                      <Input
                        value={item.title}
                        onChange={(e) => handleUpdateActivity(index, 'title', e.target.value)}
                        className="font-medium"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs text-gray-500 uppercase tracking-wide">Description</Label>
                      <Textarea
                        value={item.description}
                        onChange={(e) => handleUpdateActivity(index, 'description', e.target.value)}
                        rows={2}
                        className="text-sm text-gray-600 min-h-[80px]"
                      />
                    </div>
                  </div>

                  {/* Actions Column */}
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
