import { useState, useEffect } from 'react';
import { Briefcase, Plus, Trash2, Save, Upload, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://nature-escape-web-back.vercel.app';

interface ServiceData {
  _id?: string;
  title: string;
  description: string;
  image: string;
}

// Fetch all services
const fetchServices = async (): Promise<ServiceData[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/service`);
    if (!response.ok) {
      throw new Error('Failed to fetch services');
    }
    const data = await response.json();
    return data.services || [];
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

// Add new service with FormData
const addServiceApi = async (serviceData: Omit<ServiceData, '_id'>, imageFile?: File): Promise<ServiceData> => {
  try {
    const formData = new FormData();
    formData.append('data', JSON.stringify({
      title: serviceData.title,
      description: serviceData.description,
      image: serviceData.image || ''
    }));

    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await fetch(`${BASE_URL}/api/service`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create service');
    }

    const data = await response.json();
    return data.service;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

// Update service with FormData
const updateServiceApi = async (id: string, serviceData: Partial<ServiceData>, imageFile?: File): Promise<ServiceData> => {
  try {
    const formData = new FormData();
    formData.append('data', JSON.stringify({
      title: serviceData.title,
      description: serviceData.description,
      image: serviceData.image || ''
    }));

    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await fetch(`${BASE_URL}/api/service/${id}`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update service');
    }

    const data = await response.json();
    return data.service;
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
};

// Delete service
const deleteServiceApi = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/api/service/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete service');
    }
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

export function ServicesSection() {
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

  // Fetch services on mount
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      const data = await fetchServices();
      setServices(data);
    } catch (error) {
      console.error('Failed to load services:', error);
      toast.error('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImageFile(file);
      setNewImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEditImageSelect = (serviceId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImageFiles(prev => ({ ...prev, [serviceId]: file }));
      setEditImagePreviews(prev => ({ ...prev, [serviceId]: URL.createObjectURL(file) }));
    }
  };

  const handleAddService = async () => {
    if (!newService.title || !newService.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
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
      await deleteServiceApi(id);
      await loadServices();
      toast.success('Service deleted successfully!');
    } catch (error) {
      console.error('Failed to delete service:', error);
      toast.error('Failed to delete service');
    }
  };

  // Local update handler for inputs
  const handleLocalUpdate = (index: number, field: keyof ServiceData, value: string) => {
    const updatedServices = [...services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    setServices(updatedServices);
  };

  // API update handler
  const handleSaveService = async (service: ServiceData) => {
    if (!service._id) return;

    try {
      setIsSaving(prev => ({ ...prev, [service._id!]: true }));
      const imageFile = editImageFiles[service._id];
      await updateServiceApi(service._id, service, imageFile);

      // Clear the edit image file after successful save
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

      await loadServices();
      toast.success('Service updated successfully!');
    } catch (error) {
      console.error('Failed to update service:', error);
      toast.error('Failed to update service');
    } finally {
      setIsSaving(prev => ({ ...prev, [service._id!]: false }));
    }
  };

  const createFileInput = (onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => onSelect(e as unknown as React.ChangeEvent<HTMLInputElement>);
    input.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Services</h3>
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
                    onClick={() => createFileInput(handleNewImageSelect)}
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
            <div key={service._id || index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-gray-900">Service {index + 1}</h4>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveService(service)}
                    disabled={isSaving[service._id || '']}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50"
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
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Remove service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Title</label>
                  <input
                    type="text"
                    value={service.title}
                    onChange={(e) => handleLocalUpdate(index, 'title', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Enter service title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={service.description}
                    onChange={(e) => handleLocalUpdate(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter service description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Image</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={service.image || ''}
                      onChange={(e) => handleLocalUpdate(index, 'image', e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Image URL"
                    />
                    <button
                      type="button"
                      onClick={() => service._id && createFileInput((e) => handleEditImageSelect(service._id!, e))}
                      className="px-4 py-2.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Browse
                    </button>
                  </div>
                  {(editImagePreviews[service._id || ''] || service.image) && (
                    <div className="relative">
                      <img
                        src={editImagePreviews[service._id || ''] || service.image}
                        alt="Service preview"
                        className="w-full h-32 object-cover rounded-lg border"
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
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
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
  );
}
