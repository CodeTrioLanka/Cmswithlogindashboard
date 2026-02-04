import { Compass, Plus, Trash2, Save, ImageIcon, LayoutTemplate, Edit, X, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchExcursions, addExcursion, updateExcursion, fetchExcursionFilters } from '../../../services/excursionApi';
import { deleteFromCloudinary } from "../../../services/deleteApi";
import { toast } from "sonner";
import { Autocomplete } from '../ui/autocomplete';
import { ImageUploadInput } from '../ui/ImageUploadInput';
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
  // Server State
  const [serverData, setServerData] = useState<ExcursionData>(INITIAL_DATA);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    categories: [] as string[],
    destinations: [] as string[],
    times: [] as string[]
  });

  // Hero Section State
  const [isEditingHero, setIsEditingHero] = useState(false);
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [heroDraft, setHeroDraft] = useState<ExcursionHero[]>([]);

  // Activities Section State
  // -1 indicates creating a NEW activity
  const [editingActivityIndex, setEditingActivityIndex] = useState<number | null>(null);
  const [activityDraft, setActivityDraft] = useState<ExcursionItem | null>(null);
  const [isSavingActivity, setIsSavingActivity] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([loadExcursions(), loadFilters()]);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load Excursions data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadExcursions = async () => {
    const data = await fetchExcursions();
    if (data) {
      // Ensure heroes array has at least one valid item
      const heroes = (data.excursionHeroes && data.excursionHeroes.length > 0)
        ? data.excursionHeroes
        : [INITIAL_HERO];

      // Ensure excursions is an array
      const excursions = Array.isArray(data.excursion) ? data.excursion : [];

      const cleanData: ExcursionData = {
        ...data,
        excursionHeroes: heroes,
        excursion: excursions
      };

      setServerData(cleanData);
      setHeroDraft(JSON.parse(JSON.stringify(heroes)));

      if (_onChange) _onChange(cleanData);
    } else {
      setServerData(INITIAL_DATA);
      setHeroDraft([INITIAL_HERO]);
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

  // --- Hero Section Handlers ---

  const handleEditHero = () => {
    setHeroDraft(JSON.parse(JSON.stringify(serverData.excursionHeroes)));
    setIsEditingHero(true);
  };

  const handleCancelHero = () => {
    setHeroDraft(JSON.parse(JSON.stringify(serverData.excursionHeroes)));
    setIsEditingHero(false);
    toast.info('Hero section changes discarded');
  };

  const handleSaveHero = async () => {
    try {
      setIsSavingHero(true);
      if (!heroDraft[0]?.title) {
        toast.error('Page Title is required');
        return;
      }

      const dataToSave: ExcursionData = {
        ...serverData,
        excursionHeroes: heroDraft
      };

      if (!dataToSave.excursionHeroes || dataToSave.excursionHeroes.length === 0) {
        dataToSave.excursionHeroes = [INITIAL_HERO];
      }

      let result;
      if (serverData._id) {
        result = await updateExcursion(serverData._id, dataToSave);
      } else {
        result = await addExcursion(dataToSave);
      }

      setServerData(result);
      setHeroDraft(JSON.parse(JSON.stringify(result.excursionHeroes)));
      setIsEditingHero(false);
      if (_onChange) _onChange(result);
      toast.success('Hero section updated successfully!');

    } catch (error) {
      console.error('Failed to save hero:', error);
      toast.error('Failed to save Hero section.');
    } finally {
      setIsSavingHero(false);
    }
  };

  const updateHeroField = (field: keyof ExcursionHero, value: string) => {
    setHeroDraft(prev => {
      const heroes = [...prev];
      if (heroes.length === 0) heroes.push({ ...INITIAL_HERO });
      heroes[0] = { ...heroes[0], [field]: value };
      return heroes;
    });
  };

  const handleHeroImageUpdate = (url: string) => {
    const currentHero = heroDraft[0] || INITIAL_HERO;
    const oldUrl = currentHero.heroImage;
    if (oldUrl && oldUrl !== url && oldUrl.includes('cloudinary')) {
      handleDeleteImage(oldUrl);
    }
    updateHeroField('heroImage', url);
  };


  // --- Activities Itemized Handlers ---

  const handleStartAddActivity = () => {
    setActivityDraft({
      title: '',
      description: '',
      image: '',
      category: '',
      time: '',
      destination: ''
    });
    setEditingActivityIndex(-1);
  };

  const handleStartEditActivity = (index: number) => {
    setActivityDraft({ ...serverData.excursion[index] });
    setEditingActivityIndex(index);
  };

  const handleCancelActivity = () => {
    setActivityDraft(null);
    setEditingActivityIndex(null);
  };

  const handleSaveActivity = async () => {
    if (!activityDraft) return;

    try {
      setIsSavingActivity(true);

      if (!activityDraft.title) {
        toast.error('Activity Title is required');
        return;
      }

      // Construct new list
      let updatedList = [...serverData.excursion];
      if (editingActivityIndex === -1) {
        // Add new
        updatedList.push(activityDraft);
      } else if (editingActivityIndex !== null) {
        // Update existing
        updatedList[editingActivityIndex] = activityDraft;
      }

      const dataToSave: ExcursionData = {
        ...serverData,
        excursion: updatedList
      };

      // Ensure hero structure is preserved
      if (!dataToSave.excursionHeroes || dataToSave.excursionHeroes.length === 0) {
        dataToSave.excursionHeroes = [INITIAL_HERO];
      }

      let result;
      if (serverData._id) {
        result = await updateExcursion(serverData._id, dataToSave);
      } else {
        result = await addExcursion(dataToSave);
      }

      setServerData(result);
      // Also update hero draft to match server just in case
      setHeroDraft(JSON.parse(JSON.stringify(result.excursionHeroes)));

      setActivityDraft(null);
      setEditingActivityIndex(null);

      if (_onChange) _onChange(result);
      toast.success(editingActivityIndex === -1 ? 'New excursion added!' : 'Excursion updated!');

    } catch (error) {
      console.error('Failed to save excursion:', error);
      toast.error('Failed to save Excursion.');
    } finally {
      setIsSavingActivity(false);
    }
  };

  const handleDeleteActivity = async (index: number) => {
    if (!confirm('Are you sure you want to delete this excursion?')) return;

    try {
      setIsSavingActivity(true);

      const itemToRemove = serverData.excursion[index];
      if (itemToRemove.image) {
        await handleDeleteImage(itemToRemove.image);
      }

      const updatedList = serverData.excursion.filter((_, i) => i !== index);
      const dataToSave = { ...serverData, excursion: updatedList };

      // Ensure hero structure
      if (!dataToSave.excursionHeroes || dataToSave.excursionHeroes.length === 0) {
        dataToSave.excursionHeroes = [INITIAL_HERO];
      }

      let result;
      if (serverData._id) {
        result = await updateExcursion(serverData._id, dataToSave);
      } else {
        result = await addExcursion(dataToSave);
      }

      setServerData(result);
      if (_onChange) _onChange(result);
      toast.success('Excursion removed successfully');

    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete excursion');
    } finally {
      setIsSavingActivity(false);
    }
  };

  const handleDraftUpdate = (field: keyof ExcursionItem, value: string) => {
    if (!activityDraft) return;
    setActivityDraft({ ...activityDraft, [field]: value });
  };

  const handleDraftImageUpdate = (url: string) => {
    if (!activityDraft) return;

    const oldUrl = activityDraft.image;
    if (oldUrl && oldUrl !== url && oldUrl.includes('cloudinary')) {
      handleDeleteImage(oldUrl);
    }
    setActivityDraft({ ...activityDraft, image: url });
  };


  // Render Helpers
  const currentHero = heroDraft[0] || INITIAL_HERO;
  const isGlobalEditing = editingActivityIndex !== null || isEditingHero;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400">Loading Excursions content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Hero Section */}
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-colors ${isEditingHero ? 'border-blue-400 ring-1 ring-blue-400' : 'border-gray-200 dark:border-gray-700'} overflow-hidden`}>
        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Hero Section</h4>
          </div>
          {/* Hero Actions */}
          <div className="flex gap-2">
            {isEditingHero ? (
              <>
                <Button
                  onClick={handleCancelHero}
                  disabled={isSavingHero}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" /> Cancel
                </Button>
                <Button
                  onClick={handleSaveHero}
                  disabled={isSavingHero}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSavingHero ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1" /> Save
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={handleEditHero}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={isGlobalEditing}
              >
                <Edit className="w-4 h-4" /> Edit
              </Button>
            )}
          </div>
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
                disabled={!isEditingHero}
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
                disabled={!isEditingHero}
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
                disabled={!isEditingHero}
                className="resize-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-gray-700 dark:text-gray-300">Hero Background Image</Label>
            <div className={`border-2 border-dashed rounded-xl p-4 transition-colors ${isEditingHero ? 'border-gray-300 hover:border-blue-400 bg-gray-50' : 'border-gray-200'}`}>
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
                    {isEditingHero && (
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

              {isEditingHero && (
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

      {/* Activities Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-2 border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-green-600" />
              Excursions List
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-sm font-semibold">
              {serverData.excursion.length}
            </span>
          </div>

          {!isGlobalEditing && (
            <Button
              onClick={handleStartAddActivity}
              className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Excursion
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Render New Activity Form if editingActivityIndex === -1 */}
          {editingActivityIndex === -1 && activityDraft && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-blue-400 ring-2 ring-blue-100 dark:ring-blue-900/20 shadow-lg p-6 relative">
              <div className="mb-4 flex items-center gap-2 text-blue-600 font-medium">
                <Plus className="w-5 h-5" />
                <span>Creating New Excursion</span>
              </div>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image Area */}
                <div className="w-full md:w-64 flex-shrink-0 space-y-3">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 relative">
                    {activityDraft.image ? (
                      <img
                        src={activityDraft.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-10 h-10 opacity-50" />
                      </div>
                    )}
                  </div>
                  <ImageUploadInput
                    value={activityDraft.image}
                    onChange={handleDraftImageUpdate}
                    placeholder="Image URL"
                    className="text-xs"
                  />
                </div>

                {/* Form Area */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase">Title <span className="text-red-500">*</span></Label>
                    <Input
                      value={activityDraft.title}
                      onChange={(e) => handleDraftUpdate('title', e.target.value)}
                      placeholder="Excursion Title"
                      className="text-lg font-semibold"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase">Description</Label>
                    <Textarea
                      value={activityDraft.description}
                      onChange={(e) => handleDraftUpdate('description', e.target.value)}
                      placeholder="Description..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {/* Classification Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-500 uppercase">Category</Label>
                      <Autocomplete
                        value={activityDraft.category}
                        onChange={(value) => handleDraftUpdate('category', value)}
                        options={filters.categories}
                        placeholder="e.g. Adventure"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-500 uppercase">Destination</Label>
                      <Autocomplete
                        value={activityDraft.destination}
                        onChange={(value) => handleDraftUpdate('destination', value)}
                        options={filters.destinations}
                        placeholder="e.g. Sigiriya"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-500 uppercase">Time</Label>
                      <Autocomplete
                        value={activityDraft.time}
                        onChange={(value) => handleDraftUpdate('time', value)}
                        options={filters.times}
                        placeholder="e.g. 5 Hours"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="ghost"
                      onClick={handleCancelActivity}
                      disabled={isSavingActivity}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveActivity}
                      disabled={isSavingActivity}
                      className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]"
                    >
                      {isSavingActivity ? 'Saving...' : 'Save New Item'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {serverData.excursion.length === 0 && editingActivityIndex !== -1 && (
            <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <Activity className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-gray-500">No excursions found.</p>
            </div>
          )}

          {serverData.excursion.map((item, index) => {
            const isEditingThis = editingActivityIndex === index;
            const dataToRender = isEditingThis && activityDraft ? activityDraft : item;

            return (
              <div
                key={index}
                className={`group bg-white dark:bg-gray-800 rounded-xl border transition-all p-6 relative
                  ${isEditingThis ? 'border-blue-400 ring-2 ring-blue-100 shadow-md' : 'border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md'}
                `}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image Area */}
                  <div className="w-full md:w-64 flex-shrink-0 space-y-3">
                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 relative">
                      {dataToRender.image ? (
                        <img
                          src={dataToRender.image}
                          alt={dataToRender.title}
                          className={`w-full h-full object-cover transition-transform ${!isEditingThis && 'group-hover:scale-105'}`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-10 h-10 opacity-50" />
                        </div>
                      )}
                    </div>
                    {isEditingThis && (
                      <ImageUploadInput
                        value={dataToRender.image}
                        onChange={handleDraftImageUpdate}
                        placeholder="Change Image URL"
                        className="text-xs"
                      />
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</Label>
                      {isEditingThis ? (
                        <Input
                          value={dataToRender.title}
                          onChange={(e) => handleDraftUpdate('title', e.target.value)}
                          className="text-lg font-semibold"
                        />
                      ) : (
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{dataToRender.title}</h4>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</Label>
                      {isEditingThis ? (
                        <Textarea
                          value={dataToRender.description}
                          onChange={(e) => handleDraftUpdate('description', e.target.value)}
                          rows={3}
                          className="resize-none"
                        />
                      ) : (
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {dataToRender.description}
                        </p>
                      )}
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 border-gray-100 dark:border-gray-700">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</Label>
                        {isEditingThis ? (
                          <Autocomplete
                            value={dataToRender.category}
                            onChange={(value) => handleDraftUpdate('category', value)}
                            options={filters.categories}
                            className="h-9"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-200">{dataToRender.category || '-'}</div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Destination</Label>
                        {isEditingThis ? (
                          <Autocomplete
                            value={dataToRender.destination}
                            onChange={(value) => handleDraftUpdate('destination', value)}
                            options={filters.destinations}
                            className="h-9"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-200">{dataToRender.destination || '-'}</div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</Label>
                        {isEditingThis ? (
                          <Autocomplete
                            value={dataToRender.time}
                            onChange={(value) => handleDraftUpdate('time', value)}
                            options={filters.times}
                            className="h-9"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-200">{dataToRender.time || '-'}</div>
                        )}
                      </div>
                    </div>

                    {/* Edit Actions */}
                    {isEditingThis && (
                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-2">
                        <Button
                          variant="ghost"
                          onClick={handleCancelActivity}
                          disabled={isSavingActivity}
                          size="sm"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveActivity}
                          disabled={isSavingActivity}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isSavingActivity ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* View Actions */}
                  {!isEditingThis && !isGlobalEditing && (
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleStartEditActivity(index)}
                        className="shadow-sm"
                      >
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteActivity(index)}
                        className="shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
