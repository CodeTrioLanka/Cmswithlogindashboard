import { useState, useEffect } from 'react';
import { Package as PackageIcon, Plus, Trash2, Edit, Save, X, Upload, Layout, Image as ImageIcon, Calendar, Settings, Clock, Users } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { ImageUploadInput } from '../ui/ImageUploadInput';
import { packagesService, type Package } from '../../../services/packages.service';
import { tourCategoriesService, type TourCategory } from '../../../services/tourCategories.service';
import { uploadToCloudinary } from '../../../services/cloudinaryApi';
import { deleteFromCloudinary } from '../../../services/deleteApi';
import { toast } from 'sonner';

export function PackagesSection() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [categories, setCategories] = useState<TourCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
    const [activeTab, setActiveTab] = useState('general');

    const [formData, setFormData] = useState<Partial<Package>>({
        packageName: '',
        slug: '',
        tourCategory: '',
        hero: { title: '', description: '', backgroundImage: '' },
        overview: {
            duration: { days: 0, nights: 0 },
            groupSize: '2-15'
        },
        itinerary: [],
        galleries: [{ title: 'Visual Journeys', images: [] }],
        isActive: true,
        featured: false,
        displayOrder: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [packagesData, categoriesData] = await Promise.all([
                packagesService.getPackages(),
                tourCategoriesService.getTourCategories()
            ]);
            console.log('Raw packages response:', packagesData);
            console.log('Loaded categories:', categoriesData.tours);

            // Handle different response structures (array vs object)
            const responseData = packagesData as any;
            const packagesList = Array.isArray(responseData)
                ? responseData
                : (responseData.packages || responseData.data || []);

            setPackages(packagesList);
            setCategories(categoriesData.tours);
        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('Failed to load data');
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

    const handleHeroImageUpdate = (url: string) => {
        const oldUrl = formData.hero?.backgroundImage;
        if (oldUrl && oldUrl !== url) handleDeleteImage(oldUrl);
        setFormData({ ...formData, hero: { ...formData.hero!, backgroundImage: url } });
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleNameChange = (name: string) => {
        const updates: Partial<Package> = { packageName: name };
        if (!formData.slug || formData.slug === generateSlug(formData.packageName || '')) {
            updates.slug = generateSlug(name);
        }
        setFormData({ ...formData, ...updates });
    };

    const handleAdd = () => {
        setIsAdding(true);
        setFormData({
            packageName: '',
            slug: '',
            tourCategory: '',
            hero: { title: '', description: '', backgroundImage: '' },
            overview: {
                duration: { days: 0, nights: 0 },
                groupSize: '2-15'
            },
            itinerary: [],
            galleries: [{ title: 'Visual Journeys', images: [] }],
            isActive: true,
            featured: false,
            displayOrder: packages.length
        });
        setActiveTab('general');
    };

    const handleEdit = (pkg: Package) => {
        console.log('Editing package:', pkg);
        setEditingId(pkg._id!);
        // Ensure legacy data doesn't break the form
        const cleanPkg = {
            ...pkg,
            overview: {
                ...pkg.overview,
                groupSize: pkg.overview.groupSize || '2-15'
            }
        };
        setFormData(cleanPkg);
        setActiveTab('general');
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({});
    };

    const handleSave = async () => {
        try {
            if (!formData.packageName || !formData.slug) {
                toast.error('Package name and slug are required');
                return;
            }

            if (!formData.tourCategory) {
                toast.error('Tour category is required');
                return;
            }

            if (!formData.hero?.title) {
                toast.error('Hero title is required');
                return;
            }

            console.log('Saving package with data:', formData);

            if (isAdding) {
                const response = await packagesService.createPackage(formData as Omit<Package, '_id'>, {});
                console.log('Create response:', response);
                toast.success(response.message || 'Package created successfully!');
            } else if (editingId) {
                console.log('Updating package ID:', editingId);
                const response = await packagesService.updatePackage(editingId, formData, {});
                console.log('Update response:', response);
                toast.success(response.message || 'Package updated successfully!');
            }

            await loadData();
            handleCancel();
        } catch (error: any) {
            console.error('Failed to save package:', error);
            toast.error(error?.message || 'Failed to save package');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this package?')) return;

        try {
            const response = await packagesService.deletePackage(id);
            toast.success(response.message || 'Package deleted successfully!');
            await loadData();
        } catch (error) {
            console.error('Failed to delete package:', error);
            toast.error('Failed to delete package');
        }
    };



    // Add/Remove functions
    const addItineraryDay = () => {
        setFormData({
            ...formData,
            itinerary: [
                ...(formData.itinerary || []),
                {
                    day: (formData.itinerary?.length || 0) + 1,
                    title: '',
                    activities: [],
                    description: '',
                    accommodation: '',
                    meals: { breakfast: false, lunch: false, dinner: false }
                }
            ]
        });
    };

    const removeItineraryDay = (index: number) => {
        const newItinerary = [...(formData.itinerary || [])];
        newItinerary.splice(index, 1);
        // Renumber days
        newItinerary.forEach((item, idx) => item.day = idx + 1);
        setFormData({ ...formData, itinerary: newItinerary });
    };



    if (isLoading) {
        return <div className="text-center py-8">Loading...</div>;
    }



    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tour Packages</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage comprehensive tour packages with detailed itineraries</p>
                </div>
                {!isAdding && !editingId && (
                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-700 to-emerald-600 text-white rounded-lg hover:from-green-800 hover:to-emerald-700 transition-all shadow-md font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Add Package
                    </button>
                )}
            </div>

            {/* Add/Edit Form */}
            {(isAdding || editingId) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Form Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <PackageIcon className="w-6 h-6 text-green-700 dark:text-green-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-xl">
                                    {isAdding ? 'Create New Package' : 'Edit Package'}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {isAdding ? 'Fill in the details to create a new tour' : `Update details for ${formData.packageName}`}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleCancel}
                                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md font-semibold"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="px-6 pt-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <TabsList className="bg-gray-100 dark:bg-gray-900/50 p-1 mb-0 border-b-0 w-full md:w-auto h-auto">
                                <TabsTrigger value="general" className="px-5 py-2.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-green-500 data-[state=active]:text-green-600">
                                    <Settings className="w-4 h-4" />
                                    General Info
                                </TabsTrigger>
                                <TabsTrigger value="hero" className="px-5 py-2.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-green-500 data-[state=active]:text-green-600">
                                    <Layout className="w-4 h-4" />
                                    Hero Section
                                </TabsTrigger>
                                <TabsTrigger value="itinerary" className="px-5 py-2.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-green-500 data-[state=active]:text-green-600">
                                    <Calendar className="w-4 h-4" />
                                    Itinerary
                                </TabsTrigger>
                                <TabsTrigger value="media" className="px-5 py-2.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-green-500 data-[state=active]:text-green-600">
                                    <ImageIcon className="w-4 h-4" />
                                    Photo Gallery
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="p-6">
                            {/* General Information Tab */}
                            <TabsContent value="general" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Package Title *</label>
                                        <input
                                            type="text"
                                            value={formData.packageName || ''}
                                            onChange={(e) => handleNameChange(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all dark:text-white"
                                            placeholder="e.g., Eastern Blue Bliss"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">URL Slug *</label>
                                        <input
                                            type="text"
                                            value={formData.slug || ''}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all dark:text-white"
                                            placeholder="e.g., eastern-blue-bliss"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Category *</label>
                                        <select
                                            value={formData.tourCategory || ''}
                                            onChange={(e) => setFormData({ ...formData, tourCategory: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all dark:text-white"
                                        >
                                            <option value="">Select category</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat._id}>{cat.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Display Order</label>
                                        <input
                                            type="number"
                                            value={formData.displayOrder || 0}
                                            onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <h5 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-green-600" />
                                        Duration & Capacity
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 px-1">Days</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={formData.overview?.duration?.days || 0}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        overview: {
                                                            ...formData.overview!,
                                                            duration: { ...formData.overview!.duration, days: parseInt(e.target.value) || 0 }
                                                        }
                                                    })}
                                                    className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 dark:text-white"
                                                />
                                                <Clock className="w-4 h-4 absolute right-3 top-3.5 text-gray-400" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 px-1">Nights</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={formData.overview?.duration?.nights || 0}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        overview: {
                                                            ...formData.overview!,
                                                            duration: { ...formData.overview!.duration, nights: parseInt(e.target.value) || 0 }
                                                        }
                                                    })}
                                                    className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 dark:text-white"
                                                />
                                                <Clock className="w-4 h-4 absolute right-3 top-3.5 text-gray-400" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 px-1">Group Size</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="e.g., 2-15"
                                                    value={formData.overview?.groupSize || ''}
                                                    onChange={(e) => setFormData({ ...formData, overview: { ...formData.overview!, groupSize: e.target.value } })}
                                                    className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 dark:text-white"
                                                />
                                                <Users className="w-4 h-4 absolute right-3 top-3.5 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-8 p-4 bg-green-50/50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                className="w-5 h-5 text-green-600 rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-green-500"
                                            />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-green-600 transition-colors">Active Package</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={formData.featured}
                                                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                                className="w-5 h-5 text-green-600 rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-green-500"
                                            />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-green-600 transition-colors">Featured Package</span>
                                    </label>
                                </div>
                            </TabsContent>

                            {/* Hero Section Tab */}
                            <TabsContent value="hero" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-gray-50 dark:bg-gray-900/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Hero Display Title *</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Eastern Blue Bliss"
                                                value={formData.hero?.title || ''}
                                                onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero!, title: e.target.value } })}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 dark:text-white"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Hero Short Description</label>
                                            <textarea
                                                placeholder="Brief description for hero section"
                                                value={formData.hero?.description || ''}
                                                onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero!, description: e.target.value } })}
                                                rows={4}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:ring-2 focus:ring-green-500 dark:text-white"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Background Cover Image</label>
                                            <ImageUploadInput
                                                value={formData.hero?.backgroundImage || ''}
                                                onChange={handleHeroImageUpdate}
                                                placeholder="Upload background image"
                                            />
                                            {formData.hero?.backgroundImage && (
                                                <div className="mt-4 relative group">
                                                    <div className="image-preview-wide">
                                                        <img src={formData.hero.backgroundImage} alt="Hero preview" className="rounded-xl" />
                                                    </div>
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                                        <span className="bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full text-xs font-bold shadow-lg">Current Background</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Itinerary Tab */}
                            <TabsContent value="itinerary" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <h5 className="font-bold text-gray-900 dark:text-white text-lg">Detailed Itinerary</h5>
                                    <button
                                        onClick={addItineraryDay}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all font-bold text-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add New Day
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {formData.itinerary && formData.itinerary.length > 0 ? (
                                        formData.itinerary.map((day, index) => (
                                            <div key={index} className="bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                                                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                                                            {day.day}
                                                        </div>
                                                        <input
                                                            type="text"
                                                            placeholder="Enter Day Title..."
                                                            value={day.title || ''}
                                                            onChange={(e) => {
                                                                const newItinerary = [...(formData.itinerary || [])];
                                                                newItinerary[index].title = e.target.value;
                                                                setFormData({ ...formData, itinerary: newItinerary });
                                                            }}
                                                            className="bg-transparent border-none focus:ring-0 font-bold text-gray-900 dark:text-white text-lg w-full md:w-96 placeholder-gray-400"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => removeItineraryDay(index)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                                        title="Delete Day"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                                                            <textarea
                                                                placeholder="What happens on this day?"
                                                                value={day.description || ''}
                                                                onChange={(e) => {
                                                                    const newItinerary = [...(formData.itinerary || [])];
                                                                    newItinerary[index].description = e.target.value;
                                                                    setFormData({ ...formData, itinerary: newItinerary });
                                                                }}
                                                                rows={4}
                                                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl resize-none focus:ring-2 focus:ring-green-500 dark:text-white text-sm"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Activities</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Sightseeing, Hiking, Swimming..."
                                                                value={day.activities?.join(', ') || ''}
                                                                onChange={(e) => {
                                                                    const newItinerary = [...(formData.itinerary || [])];
                                                                    newItinerary[index].activities = e.target.value.split(',').map(a => a.trim()).filter(a => a);
                                                                    setFormData({ ...formData, itinerary: newItinerary });
                                                                }}
                                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 dark:text-white text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Accommodation</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Hotel or Resort name"
                                                                value={day.accommodation || ''}
                                                                onChange={(e) => {
                                                                    const newItinerary = [...(formData.itinerary || [])];
                                                                    newItinerary[index].accommodation = e.target.value;
                                                                    setFormData({ ...formData, itinerary: newItinerary });
                                                                }}
                                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 dark:text-white text-sm"
                                                            />
                                                        </div>
                                                        <div className="space-y-3">
                                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Meals Included</label>
                                                            <div className="flex gap-4 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={day.meals?.breakfast || false}
                                                                        onChange={(e) => {
                                                                            const newItinerary = [...(formData.itinerary || [])];
                                                                            newItinerary[index].meals = { ...newItinerary[index].meals!, breakfast: e.target.checked };
                                                                            setFormData({ ...formData, itinerary: newItinerary });
                                                                        }}
                                                                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
                                                                    />
                                                                    B'fast
                                                                </label>
                                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={day.meals?.lunch || false}
                                                                        onChange={(e) => {
                                                                            const newItinerary = [...(formData.itinerary || [])];
                                                                            newItinerary[index].meals = { ...newItinerary[index].meals!, lunch: e.target.checked };
                                                                            setFormData({ ...formData, itinerary: newItinerary });
                                                                        }}
                                                                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
                                                                    />
                                                                    Lunch
                                                                </label>
                                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={day.meals?.dinner || false}
                                                                        onChange={(e) => {
                                                                            const newItinerary = [...(formData.itinerary || [])];
                                                                            newItinerary[index].meals = { ...newItinerary[index].meals!, dinner: e.target.checked };
                                                                            setFormData({ ...formData, itinerary: newItinerary });
                                                                        }}
                                                                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
                                                                    />
                                                                    Dinner
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 bg-white dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 font-medium">No days added yet. Start by adding Day 1.</p>
                                        </div>
                                    )}
                                    <button
                                        onClick={addItineraryDay}
                                        className="w-full py-4 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-gray-500 dark:text-gray-400 hover:border-green-500 hover:text-green-600 hover:bg-green-50/30 transition-all flex items-center justify-center gap-2 font-bold"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Add Another Day to Itinerary
                                    </button>
                                </div>
                            </TabsContent>

                            {/* Photo Gallery Tab */}
                            <TabsContent value="media" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-gray-50 dark:bg-gray-900/30 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Gallery Section Title</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Visual Journeys"
                                                value={formData.galleries?.[0]?.title || ''}
                                                onChange={(e) => {
                                                    const galleries = [...(formData.galleries || [{ title: 'Visual Journeys', images: [] }])];
                                                    galleries[0] = { ...galleries[0], title: e.target.value };
                                                    setFormData({ ...formData, galleries });
                                                }}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 dark:text-white"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Package Images *</label>
                                            <div className="flex flex-col gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const input = document.createElement('input');
                                                        input.type = 'file';
                                                        input.multiple = true;
                                                        input.accept = 'image/*';
                                                        input.onchange = async (e) => {
                                                            const files = Array.from((e.target as HTMLInputElement).files || []);
                                                            if (files.length > 0) {
                                                                try {
                                                                    setUploading(prev => ({ ...prev, gallery: true }));
                                                                    const newUrls: string[] = [];
                                                                    for (const file of files) {
                                                                        const url = await uploadToCloudinary(file);
                                                                        newUrls.push(url);
                                                                    }
                                                                    const galleries = [...(formData.galleries || [{ title: 'Visual Journeys', images: [] }])];
                                                                    galleries[0] = {
                                                                        ...galleries[0],
                                                                        images: [...(galleries[0].images || []), ...newUrls]
                                                                    };
                                                                    setFormData({ ...formData, galleries });
                                                                    toast.success(`${newUrls.length} images uploaded!`);
                                                                } catch (error) {
                                                                    console.error('Gallery upload failed:', error);
                                                                    toast.error('Failed to upload gallery images');
                                                                } finally {
                                                                    setUploading(prev => ({ ...prev, gallery: false }));
                                                                    input.value = '';
                                                                }
                                                            }
                                                        };
                                                        input.click();
                                                    }}
                                                    disabled={uploading.gallery}
                                                    className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all flex flex-col items-center justify-center gap-3 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800/80 shadow-inner"
                                                >
                                                    {uploading.gallery ? (
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                                                            <span className="font-bold text-green-600">Uploading multiple images...</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-2xl text-green-600 dark:text-green-500 shadow-sm transition-transform group-hover:scale-110">
                                                                <Upload className="w-8 h-8" />
                                                            </div>
                                                            <div className="text-center">
                                                                <span className="font-bold text-gray-900 dark:text-white text-lg">Add Gallery Photos</span>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-64">Select one or more stunning photos of this tour package</p>
                                                            </div>
                                                        </>
                                                    )}
                                                </button>

                                                {formData.galleries?.[0]?.images && formData.galleries[0].images.length > 0 && (
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-2">
                                                        {formData.galleries[0].images.map((img, idx) => (
                                                            <div key={idx} className="group relative aspect-square bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm transition-transform hover:-translate-y-1">
                                                                <img
                                                                    src={img}
                                                                    alt={`Gallery ${idx + 1}`}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 backdrop-blur-[1px]">
                                                                    <button
                                                                        onClick={() => {
                                                                            const galleries = [...(formData.galleries || [{ title: 'Visual Journeys', images: [] }])];
                                                                            const imageToDelete = galleries[0].images[idx];
                                                                            handleDeleteImage(imageToDelete);
                                                                            galleries[0].images = galleries[0].images.filter((_, i) => i !== idx);
                                                                            setFormData({ ...formData, galleries });
                                                                        }}
                                                                        className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-xl active:scale-95"
                                                                        title="Remove image"
                                                                    >
                                                                        <Trash2 className="w-5 h-5" />
                                                                    </button>
                                                                </div>
                                                                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 text-white text-[10px] font-bold rounded-full opacity-60 backdrop-blur-md">
                                                                    #{idx + 1}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            )}

            {/* Package List */}
            <div className="grid grid-cols-1 gap-4">
                {packages.map((pkg) => (
                    <div key={pkg._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{pkg.packageName}</h4>
                                    {pkg.featured && <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 rounded-full font-medium">⭐ Featured</span>}
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${pkg.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'}`}>
                                        {pkg.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    <strong>Category:</strong> {typeof pkg.tourCategory === 'object' ? (pkg.tourCategory as any).title : 'N/A'}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    <strong>Duration:</strong> {pkg.overview.duration.days} Days | {pkg.overview.duration.nights} Nights
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{pkg.hero.description}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Slug: <code className="bg-gray-100 dark:bg-gray-900/50 px-2 py-1 rounded">{pkg.slug}</code></p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(pkg)}
                                    className="p-2 text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(pkg._id!)}
                                    className="p-2 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {packages.length === 0 && !isAdding && !editingId && (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <PackageIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium">No packages yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Click "Add Package" to create your first tour package</p>
                </div>
            )}
        </div>
    );
}
