import { useState } from 'react';
import { Briefcase, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import type { ServiceData } from '../../App';

interface ServicesSectionProps {
  data: ServiceData[];
  onChange: (data: ServiceData[]) => void;
}

export function ServicesSection({ data = [], onChange }: ServicesSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newService, setNewService] = useState<ServiceData>({
    title: '',
    description: '',
    icon: ''
  });

  const handleAddService = () => {
    if (newService.title && newService.description) {
      onChange([...data, newService]);
      setNewService({ title: '', description: '', icon: '' });
      setIsDialogOpen(false);
    }
  };

  const handleRemoveService = (index: number) => {
    const newData = [...data];
    newData.splice(index, 1);
    onChange(newData);
  };

  const handleUpdateService = (index: number, field: keyof ServiceData, value: string) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
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
                <Label htmlFor="icon">Image</Label>
                <Input
                  id="icon"
                  placeholder="e.g., map, plane, car"
                  value={newService.icon}
                  onChange={(e) => setNewService({ ...newService, icon: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddService}>Save Service</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((service, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900">Service {index + 1}</h4>
              </div>
              <button
                onClick={() => handleRemoveService(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Remove service"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Title</label>
                <input
                  type="text"
                  value={service.title}
                  onChange={(e) => handleUpdateService(index, 'title', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter service title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={service.description}
                  onChange={(e) => handleUpdateService(index, 'description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Enter service description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon Name</label>
                <input
                  type="text"
                  value={service.icon}
                  onChange={(e) => handleUpdateService(index, 'icon', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., map, plane, car"
                />
              </div>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            No services added yet. Click "Add Service" to get started.
          </div>
        )}
      </div>
    </div>
  );
}
