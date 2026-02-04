import { useState, useEffect } from 'react';
import { Briefcase, Plus, Trash2, Save, X, Edit, LayoutTemplate, ImageIcon } from 'lucide-react';
import { ImageUploadInput } from '../ui/ImageUploadInput';
import { deleteFromCloudinary } from '../../../services/deleteApi';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://nature-escape-web-back.vercel.app';

// ============ INTERFACES ============
interface ServiceData {
  _id?: string;
  title: string;
  description: string;
  image: string;
}

interface ServiceHeroData {
  _id?: string;
  heroImage: string;
  title: string;
  subtitle: string;
  description: string;
}

// ============ UNIFIED API ============
const fetchServicePageData = async (): Promise<{ hero: ServiceHeroData | null; services: ServiceData[] }> => {
  try {
    const response = await fetch(`${BASE_URL}/api/service-page`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch service page data');
    const data = await response.json();
    return {
      hero: data.hero || null,
      services: data.services || []
    };
  } catch (error) {
    console.error('Error fetching service page data:', error);
    throw error;
  }
};

// ============ SERVICE HERO API ============
const saveServiceHero = async (heroData: Partial<ServiceHeroData>, imageFile?: File): Promise<ServiceHeroData> => {
  try {
    const formData = new FormData();
    formData.append('data', JSON.stringify(heroData));
    if (imageFile) {
      formData.append('image', imageFile);
    }
    const response = await fetch(`${BASE_URL}/api/service-page/hero`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to save service hero');
    const data = await response.json();
    return data.hero;
  } catch (error) {
    console.error('Error saving service hero:', error);
    throw error;
  }
};

// ============ SERVICES API ============
const addServiceApi = async (serviceData: Omit<ServiceData, '_id'>, imageFile?: File): Promise<ServiceData> => {
  try {
    const formData = new FormData();
    formData.append('data', JSON.stringify(serviceData));
    if (imageFile) {
      formData.append('image', imageFile);
    }
    const response = await fetch(`${BASE_URL}/api/service-page/services`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to create service');
    const data = await response.json();
    return data.service;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

const updateServiceApi = async (id: string, serviceData: Partial<ServiceData>, imageFile?: File): Promise<ServiceData> => {
  try {
    const formData = new FormData();
    formData.append('data', JSON.stringify(serviceData));
    if (imageFile) {
      formData.append('image', imageFile);
    }
    const response = await fetch(`${BASE_URL}/api/service-page/services/${id}`, {
      method: 'PUT',
      body: formData,
      credentials: 'include'
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Server Error Details:', errorData);
      throw new Error(errorData.error || 'Failed to update service');
    }
    const data = await response.json();
    return data.service;
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
};

const deleteServiceApi = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/api/service-page/services/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to delete service');
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

const INITIAL_HERO: ServiceHeroData = {
  heroImage: '',
  title: 'Our Services',
  subtitle: 'What we offer',
  description: 'Explore the range of services we provide.'
};

// ============ MAIN COMPONENT ============
export function ServicesSection() {
  // Global Loading
  const [isLoading, setIsLoading] = useState(false);

  // Hero state
  const [heroData, setHeroData] = useState<ServiceHeroData>(INITIAL_HERO);
  const [originalHeroData, setOriginalHeroData] = useState<ServiceHeroData | null>(null);
  const [isHeroEditing, setIsHeroEditing] = useState(false);
  const [heroLoading, setHeroLoading] = useState(false);

  // Services state
  const [services, setServices] = useState<ServiceData[]>([]);

  // Itemized Editing State
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceDraft, setServiceDraft] = useState<ServiceData | null>(null);
  const [isSavingService, setIsSavingService] = useState(false);

  // New Service State (Inline)
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newServiceDraft, setNewServiceDraft] = useState<Omit<ServiceData, '_id'>>({
    title: '',
    description: '',
    image: ''
  });
  const [isSavingNew, setIsSavingNew] = useState(false);


  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchServicePageData();

      if (data.hero) {
        setHeroData(data.hero);
        setOriginalHeroData(data.hero);
      } else {
        setHeroData(INITIAL_HERO);
        setOriginalHeroData(INITIAL_HERO);
      }

      setServices(data.services);
    } catch (error) {
      console.error('Failed to load services data:', error);
      toast.error('Failed to load services data');
    } finally {
      setIsLoading(false);
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


  // ============ HERO HANDLERS ============

  const handleHeroCancel = () => {
    setHeroData(originalHeroData || INITIAL_HERO);
    setIsHeroEditing(false);
    toast.info('Hero section changes discarded');
  };

  const handleHeroInputChange = (field: keyof ServiceHeroData, value: string) => {
    setHeroData(prev => ({ ...prev, [field]: value }));
  };

  const handleHeroImageUpdate = (url: string) => {
    const oldUrl = heroData.heroImage;
    if (oldUrl && oldUrl !== url) handleDeleteImage(oldUrl);
    handleHeroInputChange('heroImage', url);
  };

  const handleHeroSave = async () => {
    try {
      setHeroLoading(true);
      if (!heroData.title) {
        toast.error('Hero title is required');
        return;
      }

      const savedHero = await saveServiceHero(heroData);
      setHeroData(savedHero);
      setOriginalHeroData(savedHero);
      setIsHeroEditing(false);
      toast.success('Hero section saved successfully!');
    } catch (error) {
      console.error('Failed to save hero data:', error);
      toast.error('Failed to save hero section');
    } finally {
      setHeroLoading(false);
    }
  };


  // ============ NEW SERVICE HANDLERS (Inline) ============

  const handleStartAddService = () => {
    setIsAddingNew(true);
    setNewServiceDraft({ title: '', description: '', image: '' });
  };

  const handleCancelAddService = () => {
    // Optional: cleanup image if uploaded and strictly managed
    setIsAddingNew(false);
    setNewServiceDraft({ title: '', description: '', image: '' });
  };

  const handleNewServiceUpdate = (field: keyof Omit<ServiceData, '_id'>, value: string) => {
    setNewServiceDraft(prev => ({ ...prev, [field]: value }));
  };

  const handleNewServiceImageUpdate = (url: string) => {
    const oldUrl = newServiceDraft.image;
    if (oldUrl && oldUrl !== url) handleDeleteImage(oldUrl);
    handleNewServiceUpdate('image', url);
  };

  const handleSaveNewService = async () => {
    if (!newServiceDraft.title || !newServiceDraft.description) {
      toast.error('Title and Description are required');
      return;
    }

    try {
      setIsSavingNew(true);
      await addServiceApi(newServiceDraft);

      // Cleanup and Reload
      setNewServiceDraft({ title: '', description: '', image: '' });
      setIsAddingNew(false);
      await loadData(); // Reload list to get the new ID and consistent state
      toast.success('Service created successfully!');
    } catch (error) {
      console.error('Failed to create service:', error);
      toast.error('Failed to create service');
    } finally {
      setIsSavingNew(false);
    }
  };


  // ============ EXISTING SERVICE HANDLERS (Itemized) ============

  const handleStartEditService = (service: ServiceData) => {
    setServiceDraft({ ...service });
    setEditingServiceId(service._id || null);
  };

  const handleCancelEditService = () => {
    setServiceDraft(null);
    setEditingServiceId(null);
  };

  const handleDraftUpdate = (field: keyof ServiceData, value: string) => {
    if (!serviceDraft) return;
    setServiceDraft({ ...serviceDraft, [field]: value });
  };

  const handleDraftImageUpdate = (url: string) => {
    if (!serviceDraft) return;
    const oldUrl = serviceDraft.image;
    if (oldUrl && oldUrl !== url) handleDeleteImage(oldUrl);
    handleDraftUpdate('image', url);
  };

  const handleSaveService = async () => {
    if (!serviceDraft || !serviceDraft._id) return;
    if (!serviceDraft.title || !serviceDraft.description) {
      toast.error('Title and Description are required');
      return;
    }

    try {
      setIsSavingService(true);
      await updateServiceApi(serviceDraft._id, serviceDraft);

      await loadData(); // Refresh list
      setServiceDraft(null);
      setEditingServiceId(null);
      toast.success('Service updated successfully!');
    } catch (error) {
      console.error('Failed to update service:', error);
      toast.error('Failed to update service');
    } finally {
      setIsSavingService(false);
    }
  };

  const handleRemoveService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    // Optimistic UI update could be done here, but since we rely on separate API,
    // safest is to just delete and reload.
    // If we want to block UI:
    const originalServices = [...services];

    try {
      // Optimistic remove for snapiness
      setServices(prev => prev.filter(s => s._id !== id));

      await deleteServiceApi(id);
      toast.success('Service deleted successfully!');
    } catch (error) {
      // Revert if failed
      setServices(originalServices);
      console.error('Failed to delete service:', error);
      toast.error('Failed to delete service');
    }
  };


  // ============ RENDER ============

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400">Loading Services content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">

      {/* ============ HERO SECTION ============ */}
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-colors ${isHeroEditing ? 'border-green-400 ring-1 ring-green-400' : 'border-gray-200 dark:border-gray-700'} overflow-hidden`}>
        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Hero Section</h4>
          </div>
          {/* Actions */}
          <div className="flex gap-2">
            {isHeroEditing ? (
              <>
                <Button
                  onClick={handleHeroCancel}
                  disabled={heroLoading}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" /> Cancel
                </Button>
                <Button
                  onClick={handleHeroSave}
                  disabled={heroLoading}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {heroLoading ? (
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
                onClick={() => setIsHeroEditing(true)}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={!!editingServiceId || isAddingNew}
              >
                <Edit className="w-4 h-4" /> Edit
              </Button>
            )}
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="hero-title">Page Title</Label>
              <Input
                id="hero-title"
                value={heroData.title}
                onChange={(e) => handleHeroInputChange('title', e.target.value)}
                placeholder="Enter hero title"
                disabled={!isHeroEditing}
                className="font-semibold text-lg"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hero-subtitle">Subtitle</Label>
              <Input
                id="hero-subtitle"
                value={heroData.subtitle}
                onChange={(e) => handleHeroInputChange('subtitle', e.target.value)}
                placeholder="Enter hero subtitle"
                disabled={!isHeroEditing}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hero-desc">Description</Label>
              <Textarea
                id="hero-desc"
                value={heroData.description}
                onChange={(e) => handleHeroInputChange('description', e.target.value)}
                placeholder="Enter hero description"
                rows={4}
                disabled={!isHeroEditing}
                className="resize-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Hero Background Image</Label>
            <div className={`border-2 border-dashed rounded-xl p-4 transition-colors ${isHeroEditing ? 'border-gray-300 hover:border-green-400 bg-gray-50' : 'border-gray-200'}`}>
              {heroData.heroImage ? (
                <div className="space-y-3">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-sm">
                    <img
                      src={heroData.heroImage}
                      alt="Hero"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={heroData.heroImage}
                      readOnly
                      className="text-xs text-gray-500 bg-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-gray-400 gap-2">
                  <ImageIcon className="w-10 h-10 opacity-50" />
                  <span className="text-sm">No image selected</span>
                </div>
              )}

              {isHeroEditing && (
                <div className="mt-4">
                  <ImageUploadInput
                    value={heroData.heroImage}
                    onChange={handleHeroImageUpdate}
                    placeholder="Paste URL or Upload New Image"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============ SERVICES LIST SECTION ============ */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-2 border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-green-600" />
              Services List
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm font-semibold">
              {services.length} items
            </span>
          </div>

          {!isHeroEditing && !editingServiceId && !isAddingNew && (
            <Button
              onClick={handleStartAddService}
              className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">

          {/* CREATE NEW SERVICE CARD */}
          {isAddingNew && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-green-400 ring-2 ring-green-100 dark:ring-green-900/20 shadow-lg p-6 relative">
              <div className="mb-4 flex items-center gap-2 text-black-600 font-medium">
                <Plus className="w-5 h-5" />
                <span>Creating New Service</span>
              </div>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image Area */}
                <div className="w-full md:w-64 flex-shrink-0 space-y-3">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 relative">
                    {newServiceDraft.image ? (
                      <img
                        src={newServiceDraft.image}
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
                    value={newServiceDraft.image}
                    onChange={handleNewServiceImageUpdate}
                    placeholder="Image URL"
                    className="text-xs"
                  />
                </div>

                {/* Form Area */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase">Title <span className="text-red-500">*</span></Label>
                    <Input
                      value={newServiceDraft.title}
                      onChange={(e) => handleNewServiceUpdate('title', e.target.value)}
                      placeholder="Service Title"
                      className="text-lg font-semibold"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase">Description <span className="text-red-500">*</span></Label>
                    <Textarea
                      value={newServiceDraft.description}
                      onChange={(e) => handleNewServiceUpdate('description', e.target.value)}
                      placeholder="Description..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="ghost"
                      onClick={handleCancelAddService}
                      disabled={isSavingNew}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveNewService}
                      disabled={isSavingNew}
                      className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]"
                    >
                      {isSavingNew ? 'Saving...' : 'Save New Item'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {services.length === 0 && !isAddingNew && (
            <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <Briefcase className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-gray-500">No services found.</p>
            </div>
          )}

          {/* SERVICE ITEMS */}
          {services.map((service, index) => {
            const isEditingThis = editingServiceId === service._id;
            const dataToRender = isEditingThis && serviceDraft ? serviceDraft : service;

            // Skip rendering this item if it's being deleted optimistically 
            // (though our logic above doesn't really remove it from 'services' state until confirmed, unless we added that optimistic logic)

            return (
              <div
                key={service._id || index}
                className={`group bg-white dark:bg-gray-800 rounded-xl border transition-all p-6 relative
                   ${isEditingThis ? 'border-green-400 ring-2 ring-green-100 shadow-md' : 'border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md'}
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
                          rows={4}
                          className="resize-none"
                        />
                      ) : (
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {dataToRender.description}
                        </p>
                      )}
                    </div>

                    {/* Edit Actions */}
                    {isEditingThis && (
                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-2">
                        <Button
                          variant="ghost"
                          onClick={handleCancelEditService}
                          disabled={isSavingService}
                          size="sm"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveService}
                          disabled={isSavingService}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isSavingService ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* View Actions */}
                  {!isEditingThis && !isHeroEditing && !isAddingNew && !editingServiceId && (
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleStartEditService(service)}
                        className="shadow-sm"
                      >
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => service._id && handleRemoveService(service._id)}
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
