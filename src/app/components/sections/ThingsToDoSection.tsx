import { useState, useEffect } from 'react';
import { Activity, Plus, Trash2, Save, ImageIcon, LayoutTemplate, Edit, X, RefreshCw } from 'lucide-react';
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

    const loadData = async () => {
        try {
            setIsLoading(true);
            const data = await getThingsToDo();
            if (data) {
                // Ensure heroes array has at least one valid item
                const heroes = (data.thingsToDoHeroes && data.thingsToDoHeroes.length > 0)
                    ? data.thingsToDoHeroes
                    : [INITIAL_HERO];

                // Ensure activities is an array
                const activities = Array.isArray(data.thingsToDo) ? data.thingsToDo : [];

                const cleanData: ThingsToDoData = {
                    ...data,
                    thingsToDoHeroes: heroes,
                    thingsToDo: activities
                };

                setFormData(cleanData);
                setOriginalData(JSON.parse(JSON.stringify(cleanData))); // Deep copy
                if (_onChange) _onChange(cleanData);
            } else {
                // No data found, keep initial strict
                setOriginalData(INITIAL_DATA);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('Failed to load Things To Do data');
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
                // Non-blocking error, user doesn't need to know technical details usually
            }
        }
    };

    const handleHeroImageUpdate = (url: string) => {
        const currentHero = formData.thingsToDoHeroes[0] || INITIAL_HERO;
        const oldUrl = currentHero.heroImage;

        // Only delete if it's a different URL and looks like a real cloud URL
        if (oldUrl && oldUrl !== url && oldUrl.includes('cloudinary')) {
            handleDeleteImage(oldUrl);
        }

        updateHeroField('heroImage', url);
    };

    const handleNewActivityImageUpdate = (url: string) => {
        const oldUrl = newActivity.image;
        if (oldUrl && oldUrl !== url && oldUrl.includes('cloudinary')) {
            handleDeleteImage(oldUrl);
        }
        setNewActivity(prev => ({ ...prev, image: url }));
    };

    const handleActivityImageUpdate = (index: number, url: string) => {
        const oldUrl = formData.thingsToDo[index].image;
        if (oldUrl && oldUrl !== url && oldUrl.includes('cloudinary')) {
            handleDeleteImage(oldUrl);
        }

        const updatedList = [...formData.thingsToDo];
        updatedList[index] = { ...updatedList[index], image: url };
        setFormData(prev => ({ ...prev, thingsToDo: updatedList }));
    };

    const handleCancel = () => {
        if (originalData) {
            setFormData(JSON.parse(JSON.stringify(originalData))); // Restore deep copy
        }
        setIsEditing(false);
        toast.info('Changes discarded');
    };

    const handleSaveAll = async () => {
        try {
            setIsSaving(true);

            // Validate before save
            if (!formData.thingsToDoHeroes[0]?.title) {
                toast.error('Page Title is required');
                return;
            }

            let result;
            const dataToSave = { ...formData };
            // Ensure strict structure
            if (!dataToSave.thingsToDoHeroes || dataToSave.thingsToDoHeroes.length === 0) {
                dataToSave.thingsToDoHeroes = [INITIAL_HERO];
            }

            if (formData._id) {
                result = await updateThingsToDo(formData._id, dataToSave);
            } else {
                result = await createThingsToDo(dataToSave);
            }

            setFormData(result);
            setOriginalData(JSON.parse(JSON.stringify(result)));
            if (_onChange) _onChange(result);

            setIsEditing(false);
            toast.success('Things To Do page updated successfully!');
        } catch (error) {
            console.error('Failed to save:', error);
            toast.error('Failed to save changes. Please try again.');
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
            toast.error('Activity Title is required');
            return;
        }
        if (!newActivity.image) {
            toast.warning('Adding an activity without an image is not recommended');
        }

        const updatedList = [...formData.thingsToDo, newActivity];
        setFormData(prev => ({ ...prev, thingsToDo: updatedList }));
        setNewActivity({ title: '', description: '', image: '' });
        setIsDialogOpen(false);
        toast.success('Activity added to list (Remember to Save Changes)');
    };

    const handleRemoveActivity = (index: number) => {
        // Optimistic UI update, but wait for save to persist
        if (confirm('Are you sure you want to remove this activity?')) {
            const itemToRemove = formData.thingsToDo[index];
            if (itemToRemove.image) handleDeleteImage(itemToRemove.image);

            const updatedList = formData.thingsToDo.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, thingsToDo: updatedList }));
        }
    };

    const handleUpdateActivity = (index: number, field: keyof ThingsToDoItem, value: string) => {
        const updatedList = [...formData.thingsToDo];
        updatedList[index] = { ...updatedList[index], [field]: value };
        setFormData(prev => ({ ...prev, thingsToDo: updatedList }));
    };

    const currentHero = formData.thingsToDoHeroes[0] || INITIAL_HERO;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading Things To Do content...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header / Actions Bar */}
            <div className="flex justify-between items-center sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md py-4 z-20 border-b border-gray-200 dark:border-gray-800 -mx-6 px-6 shadow-sm">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Activity className="w-6 h-6 text-green-600" />
                        Things To Do
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage page hero and activity listings</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="icon" onClick={loadData} title="Refresh Data">
                        <RefreshCw className="w-4 h-4" />
                    </Button>
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
                    <LayoutTemplate className="w-5 h-5 text-blue-500" />
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
                                placeholder="e.g. Things To Do"
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
                                placeholder="e.g. Discover our activities"
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

            {/* Activities Section */}
            <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Activities</h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-sm font-semibold">
                            {formData.thingsToDo.length}
                        </span>
                    </div>

                    {isEditing && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add New Activity
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Add New Activity</DialogTitle>
                                    <DialogDescription>Create a new "Thing To Do" card for the website.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-5 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="new-title">Title <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="new-title"
                                            value={newActivity.title}
                                            onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                                            placeholder="e.g. Hiking Adventures"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="new-desc">Description</Label>
                                        <Textarea
                                            id="new-desc"
                                            value={newActivity.description}
                                            onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                                            placeholder="Brief description of the activity..."
                                            rows={3}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Activity Image</Label>
                                        <ImageUploadInput
                                            value={newActivity.image}
                                            onChange={handleNewActivityImageUpdate}
                                            placeholder="Upload or paste image URL"
                                        />
                                        {newActivity.image && (
                                            <div className="mt-2 relative rounded-lg overflow-hidden border border-gray-200 h-40">
                                                <img
                                                    src={newActivity.image}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleAddActivity} className="bg-green-600 text-white hover:bg-green-700">Add Activity</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {formData.thingsToDo.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            <Activity className="w-8 h-8 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">No Activities Yet</h4>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm text-center mt-1">
                            Get started by clicking the "Edit Content" button and adding your first activity.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {formData.thingsToDo.map((item, index) => (
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
                                                onChange={(url) => handleActivityImageUpdate(index, url)}
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
                                                onChange={(e) => handleUpdateActivity(index, 'title', e.target.value)}
                                                disabled={!isEditing}
                                                className={`text-lg font-semibold ${!isEditing && 'border-transparent px-0 shadow-none'}`}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</Label>
                                            <Textarea
                                                value={item.description}
                                                onChange={(e) => handleUpdateActivity(index, 'description', e.target.value)}
                                                disabled={!isEditing}
                                                rows={3}
                                                className={`resize-none ${!isEditing && 'border-transparent px-0 shadow-none bg-transparent'}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Action Area */}
                                    {isEditing && (
                                        <div className="absolute top-4 right-4 md:static md:flex md:flex-col md:justify-start">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                                                onClick={() => handleRemoveActivity(index)}
                                                title="Remove Activity"
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
