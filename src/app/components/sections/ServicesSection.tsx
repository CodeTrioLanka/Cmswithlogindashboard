import { useState, useEffect } from 'react';
import { Briefcase, Plus, Trash2, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import type { ServiceData } from '../../App';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://nature-escape-web-back.vercel.app';

const fetchServices = async (): Promise<ServiceData[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/service`);
    if (!response.ok) {
      throw new Error('Failed to fetch services');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

const addService = async (service: ServiceData): Promise<ServiceData> => {
  try {
    const response = await fetch(`${BASE_URL}/api/service`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(service),
    });

    if (!response.ok) {
      throw new Error('Failed to create service');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

const updateService = async (id: string, service: Partial<ServiceData>): Promise<ServiceData> => {
  try {
    const response = await fetch(`${BASE_URL}/api/service/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(service),
    });

    if (!response.ok) {
      throw new Error('Failed to update service');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
};

const deleteService = async (id: string): Promise<void> => {
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

interface ServicesSectionProps {
  data: ServiceData[];
  onChange: (data: ServiceData[]) => void;
}

export function ServicesSection({ data: _initialData, onChange: _onChange }: ServicesSectionProps) {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newService, setNewService] = useState<ServiceData>({
    title: '',
    description: '',
    image: ''
  });

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddService = async () => {
    if (newService.title && newService.description) {
      try {
        setIsLoading(true);
        await addService(newService);
        setNewService({ title: '', description: '', image: '' });
        setIsDialogOpen(false);
        await loadServices();
      } catch (error) {
        console.error('Failed to create service:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRemoveService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      await deleteService(id);
      await loadServices();
    } catch (error) {
      console.error('Failed to delete service:', error);
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
      await updateService(service._id, service);
      alert('Service updated successfully!');
    } catch (error) {
      console.error('Failed to update service:', error);
      alert('Failed to update service');
    }
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
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md font-medium">
              <Plus className="w-4 h-4" />
              Add Service
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new service to your offerings.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Service Title</Label>
                <Input
                  id="title"
                  placeholder="Enter service title"
                  value={newService.title}
                  onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter service description"
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  placeholder="e.g., map, plane, car"
                  value={newService.image}
                  onChange={(e) => setNewService({ ...newService, image: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
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
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">Service {index + 1}</h4>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveService(service)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Save changes"
                  >
                    <Save className="w-4 h-4" />
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
              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Remove service">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Title</label>
                  <input
                    type="text"
                    value={service.title}
                    onChange={(e) => handleLocalUpdate(index, 'title', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter service title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={service.description}
                    onChange={(e) => handleLocalUpdate(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter service description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">image Name</label>
                  <input
                    type="text"
                    value={service.image}
                    onChange={(e) => handleLocalUpdate(index, 'image', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., map, plane, car"
                  />
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

