import { useState, useEffect } from 'react';
import { Briefcase, Plus, Trash2, Save, Upload, X, Edit, Image } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

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
    const response = await fetch(`${BASE_URL}/api/service-page`);
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
    });
    if (!response.ok) throw new Error('Failed to delete service');
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

// ============ MAIN COMPONENT ============
export function ServicesSection() {
  // Hero state
  const [heroData, setHeroData] = useState<ServiceHeroData>({
    heroImage: '',
    title: '',
    subtitle: '',
    description: '',
  });
  const [originalHeroData, setOriginalHeroData] = useState<ServiceHeroData | null>(null);
  const [isHeroEditing, setIsHeroEditing] = useState(false);
  const [heroLoading, setHeroLoading] = useState(false);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string>('');

  // Services state
  const [services, setServices] = useState<ServiceData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState<{ [key: string]: boolean }>({});
  const [newService, setNewService] = useState<Omit<ServiceData, '_id'>>({
    title: '',
    description: '',
    image: ''
  });
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string>('');
  const [editImageFiles, setEditImageFiles] = useState<{ [key: string]: File }>({});
  const [editImagePreviews, setEditImagePreviews] = useState<{ [key: string]: string }>({});

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setHeroLoading(true);
      const data = await fetchServicePageData();

      if (data.hero) {
        setHeroData(data.hero);
        setOriginalHeroData(data.hero);
      }

      setServices(data.services);
    } catch (error) {
      console.error('Failed to load services data:', error);
      toast.error('Failed to load services data');
    } finally {
      setIsLoading(false);
      setHeroLoading(false);
    }
  };

  // ============ HERO HANDLERS ============
  const loadHeroData = async () => {
    // This is now handled by loadData() but kept as a wrapper for hero updates
    await loadData();
  };

  const handleHeroCancel = () => {
    setHeroData(originalHeroData || {
      heroImage: '',
      title: '',
      subtitle: '',
      description: '',
    });
    setHeroImageFile(null);
    setHeroImagePreview('');
    setIsHeroEditing(false);
  };

  const handleHeroInputChange = (field: keyof ServiceHeroData, value: string) => {
    setHeroData(prev => ({ ...prev, [field]: value }));
  };

  const handleHeroImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeroImageFile(file);
      setHeroImagePreview(URL.createObjectURL(file));
    }
  };

  const handleHeroSave = async () => {
    try {
      setHeroLoading(true);
      await saveServiceHero(heroData, heroImageFile || undefined);
      await loadHeroData();
      setHeroImageFile(null);
      setHeroImagePreview('');
      setIsHeroEditing(false);
      toast.success('Hero section saved successfully!');
    } catch (error) {
      console.error('Failed to save hero data:', error);
      toast.error('Failed to save hero section');
    } finally {
      setHeroLoading(false);
    }
  };

  // ============ SERVICES HANDLERS ============
  const loadServices = async () => {
    // This is now handled by loadData() but kept as a wrapper for service updates
    await loadData();
  };

  const handleNewImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size too large. Please select an image under 5MB.');
        return;
      }
      setNewImageFile(file);
      setNewImagePreview(URL.createObjectURL(file));
      setNewService(prev => ({ ...prev, image: '' }));
    }
  };

  const handleEditImageSelect = (serviceId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('File selected for service:', serviceId, file?.name);
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size too large. Please select an image under 5MB.');
        return;
      }
      setEditImageFiles(prev => ({ ...prev, [serviceId]: file }));
      setEditImagePreviews(prev => ({ ...prev, [serviceId]: URL.createObjectURL(file) }));

      // Clear the text input by updating the service state
      setServices(prevServices =>
        prevServices.map(s =>
          s._id === serviceId ? { ...s, image: '' } : s
        )
      );
    }
  };

  const handleAddService = async () => {
    if (!newService.title || !newService.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      setIsLoading(true);
      console.log('Adding new service. Image file:', newImageFile?.name);
      await addServiceApi(newService, newImageFile || undefined);
      setNewService({ title: '', description: '', image: '' });
      setNewImageFile(null);
      setNewImagePreview('');
      setIsDialogOpen(false);
      await loadServices();
      toast.success('Service created successfully!');
    } catch (error) {
      console.error('Failed to create service:', error);
      toast.error('Failed to create service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      console.log('Deleting service:', id);
      await deleteServiceApi(id);
      await loadServices();
      toast.success('Service deleted successfully!');
    } catch (error) {
      console.error('Failed to delete service:', error);
      toast.error('Failed to delete service');
    }
  };

  const handleLocalUpdate = (index: number, field: keyof ServiceData, value: string) => {
    const updatedServices = [...services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    setServices(updatedServices);
  };

  const handleSaveService = async (service: ServiceData) => {
    console.log('handleSaveService triggered for:', service);
    if (!service._id) {
      console.error('Cannot save service: missing _id', service);
      toast.error('Cannot save: Service ID missing');
      return;
    }

    try {
      setIsSaving(prev => ({ ...prev, [service._id!]: true }));
      const imageFile = editImageFiles[service._id!];
      console.log('File found for update:', imageFile ? imageFile.name : 'No file');

      console.log('Sending update to API...');

      // Sanitize service data to ensure we only send what's needed
      const servicePayload = {
        title: service.title,
        description: service.description,
        image: service.image
      };

      const updatedService = await updateServiceApi(service._id, servicePayload, imageFile);
      console.log('API Response:', updatedService);

      if (imageFile) {
        setEditImageFiles(prev => {
          const newFiles = { ...prev };
          delete newFiles[service._id!];
          return newFiles;
        });
        setEditImagePreviews(prev => {
          const newPreviews = { ...prev };
          delete newPreviews[service._id!];
          return newPreviews;
        });
      }

      // Reload is important to get the authoritative state back
      await loadServices();
      toast.success('Service updated successfully!');
    } catch (error) {
      console.error('Failed to update service:', error);
      toast.error(`Failed to update service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(prev => ({ ...prev, [service._id!]: false }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Hidden file inputs for easier access */}
      <input
        type="file"
        id="hero-image-input"
        className="hidden"
        accept="image/*"
        onChange={handleHeroImageSelect}
      />
      <input
        type="file"
        id="new-service-image-input"
        className="hidden"
        accept="image/*"
        onChange={handleNewImageSelect}
      />

      {/* ============ SERVICES HERO SECTION ============ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Services Hero Section</h3>
          </div>
          <div className="flex gap-2">
            {isHeroEditing && (
              <button
                onClick={handleHeroCancel}
                disabled={heroLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-all"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
            <button
              onClick={isHeroEditing ? handleHeroSave : () => setIsHeroEditing(true)}
              disabled={heroLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all"
            >
              {isHeroEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              {heroLoading ? 'Saving...' : isHeroEditing ? 'Save' : 'Edit'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hero Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image</label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={heroData.heroImage}
                onChange={(e) => handleHeroInputChange('heroImage', e.target.value)}
                readOnly={!isHeroEditing}
                className={`flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${!isHeroEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="Hero image URL"
              />
              <button
                type="button"
                onClick={() => document.getElementById('hero-image-input')?.click()}
                disabled={!isHeroEditing}
                className={`px-4 py-2.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2 ${!isHeroEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload className="w-4 h-4" />
                Browse
              </button>
            </div>
            {(heroImagePreview || heroData.heroImage) && (
              <div className="relative">
                <img
                  src={heroImagePreview || heroData.heroImage}
                  alt="Hero preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                {heroImagePreview && isHeroEditing && (
                  <button
                    onClick={() => {
                      setHeroImageFile(null);
                      setHeroImagePreview('');
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Hero Text Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={heroData.title}
                onChange={(e) => handleHeroInputChange('title', e.target.value)}
                readOnly={!isHeroEditing}
                className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${!isHeroEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="Enter hero title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
              <input
                type="text"
                value={heroData.subtitle}
                onChange={(e) => handleHeroInputChange('subtitle', e.target.value)}
                readOnly={!isHeroEditing}
                className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${!isHeroEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="Enter hero subtitle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={heroData.description}
                onChange={(e) => handleHeroInputChange('description', e.target.value)}
                readOnly={!isHeroEditing}
                rows={4}
                className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none ${!isHeroEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="Enter hero description"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============ SERVICES LIST SECTION ============ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Services List</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">Manage your service offerings</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md font-medium">
                <Plus className="w-4 h-4" />
                Add Service
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
                <DialogDescription>
                  Fill in the details below to add a new service to your offerings.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Service Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter service title"
                    value={newService.title}
                    onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter service description"
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Service Image</Label>
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="Image URL (or upload below)"
                      value={newService.image}
                      onChange={(e) => setNewService({ ...newService, image: e.target.value })}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('new-service-image-input')?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Browse
                    </Button>
                  </div>
                  {(newImagePreview || newService.image) && (
                    <div className="relative mt-2">
                      <img
                        src={newImagePreview || newService.image}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      {newImagePreview && (
                        <button
                          onClick={() => {
                            setNewImageFile(null);
                            setNewImagePreview('');
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddService} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Service'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading && services.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Loading services...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <div key={service._id || index} className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-green-600" />
                    <h4 className="font-semibold text-gray-900">Service {index + 1}</h4>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveService(service)}
                      disabled={isSaving[service._id || '']}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-all disabled:opacity-50"
                      title="Save changes"
                    >
                      {isSaving[service._id || ''] ? (
                        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => service._id && handleRemoveService(service._id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                      title="Remove service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={service.title}
                      onChange={(e) => handleLocalUpdate(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm"
                      placeholder="Service title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={service.description}
                      onChange={(e) => handleLocalUpdate(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none text-sm"
                      placeholder="Service description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="url"
                        value={service.image || ''}
                        onChange={(e) => handleLocalUpdate(index, 'image', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm"
                        placeholder="Image URL"
                      />
                      <input
                        type="file"
                        id={`service-image-input-${service._id}`}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleEditImageSelect(service._id!, e)}
                        onClick={(e) => ((e.target as HTMLInputElement).value = '')}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const fileInput = document.getElementById(`service-image-input-${service._id}`);
                          if (fileInput) fileInput.click();
                          else console.error('File input not found for ID:', service._id);
                        }}
                        className="px-3 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-1 text-sm"
                      >
                        <Upload className="w-3 h-3" />
                        Browse
                      </button>
                    </div>
                    {(editImagePreviews[service._id || ''] || service.image) && (
                      <div className="relative">
                        <img
                          src={editImagePreviews[service._id || ''] || service.image}
                          alt="Service preview"
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        {editImagePreviews[service._id || ''] && (
                          <button
                            onClick={() => {
                              setEditImageFiles(prev => {
                                const newFiles = { ...prev };
                                delete newFiles[service._id!];
                                return newFiles;
                              });
                              setEditImagePreviews(prev => {
                                const newPreviews = { ...prev };
                                delete newPreviews[service._id!];
                                return newPreviews;
                              });
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {services.length === 0 && (
              <div className="col-span-1 md:col-span-2 text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                No services added yet. Click "Add Service" to get started.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
