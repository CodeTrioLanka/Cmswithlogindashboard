import { useState, useEffect } from 'react';
import { Package as PackageIcon, Plus, Trash2, Edit, Save, X, ChevronDown, ChevronUp, Upload, Image as ImageIcon } from 'lucide-react';
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
    const [expandedSection, setExpandedSection] = useState<string>('basic');
    const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

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
        setExpandedSection('basic');
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
        setExpandedSection('basic');
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

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? '' : section);
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

    const SectionHeader = ({ title, id }: { title: string; id: string }) => (
        <button
            onClick={() => toggleSection(id)}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-lg transition-all border border-gray-200"
        >
            <h5 className="font-semibold text-gray-900">{title}</h5>
            {expandedSection === id ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Tour Packages</h3>
                    <p className="text-sm text-gray-600 mt-1">Manage comprehensive tour packages with detailed itineraries</p>
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
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-semibold text-gray-900 text-xl flex items-center gap-2">
                            <PackageIcon className="w-6 h-6 text-green-700" />
                            {isAdding ? 'Create New Package' : 'Edit Package'}
                        </h4>
                        <div className="flex gap-2">
                            <button onClick={handleSave} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md">
                                <Save className="w-4 h-4" />
                                Save
                            </button>
                            <button onClick={handleCancel} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all">
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Basic Info */}
                        <div>
                            <SectionHeader title="📋 Basic Information" id="basic" />
                            {expandedSection === 'basic' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 border border-gray-200 border-t-0 rounded-b-lg bg-gray-50">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Package Name *</label>
                                        <input
                                            type="text"
                                            value={formData.packageName || ''}
                                            onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="e.g., Eastern Blue Bliss"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                                        <input
                                            type="text"
                                            value={formData.slug || ''}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="e.g., eastern-blue-bliss"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tour Category *</label>
                                        <select
                                            value={formData.tourCategory || ''}
                                            onChange={(e) => setFormData({ ...formData, tourCategory: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        >
                                            <option value="">Select category</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat._id}>{cat.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                                        <input
                                            type="number"
                                            value={formData.displayOrder || 0}
                                            onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="flex gap-6 md:col-span-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                className="w-4 h-4 text-green-600 rounded"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Active</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.featured}
                                                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                                className="w-4 h-4 text-green-600 rounded"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Featured</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Hero Section */}
                        <div>
                            <SectionHeader title="🎯 Hero Section" id="hero" />
                            {expandedSection === 'hero' && (
                                <div className="grid grid-cols-1 gap-4 p-6 border border-gray-200 border-t-0 rounded-b-lg bg-gray-50">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Eastern Blue Bliss"
                                            value={formData.hero?.title || ''}
                                            onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero!, title: e.target.value } })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Hero Description</label>
                                        <textarea
                                            placeholder="Brief description for hero section"
                                            value={formData.hero?.description || ''}
                                            onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero!, description: e.target.value } })}
                                            rows={3}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Background Image URL</label>
                                        <ImageUploadInput
                                            value={formData.hero?.backgroundImage || ''}
                                            onChange={handleHeroImageUpdate}
                                            placeholder="Image URL"
                                        />
                                        {formData.hero?.backgroundImage && (
                                            <img src={formData.hero.backgroundImage} alt="Hero preview" className="mt-3 w-full h-48 object-cover rounded-lg border" />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Overview */}
                        <div>
                            <SectionHeader title="📊 Overview Details" id="overview" />
                            {expandedSection === 'overview' && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6 border border-gray-200 border-t-0 rounded-b-lg bg-gray-50">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Days</label>
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
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nights</label>
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
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Group Size</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., 2-15"
                                            value={formData.overview?.groupSize || ''}
                                            onChange={(e) => setFormData({ ...formData, overview: { ...formData.overview!, groupSize: e.target.value } })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Itinerary */}
                        <div>
                            <SectionHeader title="📅 Day-by-Day Itinerary" id="itinerary" />
                            {expandedSection === 'itinerary' && (
                                <div className="p-6 border border-gray-200 border-t-0 rounded-b-lg bg-gray-50 space-y-4">
                                    {formData.itinerary && formData.itinerary.length > 0 ? (
                                        formData.itinerary.map((day, index) => (
                                            <div key={index} className="bg-white p-4 rounded-lg border border-gray-300 shadow-sm">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h6 className="font-semibold text-gray-900">Day {day.day}</h6>
                                                    <button
                                                        onClick={() => removeItineraryDay(index)}
                                                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Day title"
                                                        value={day.title || ''}
                                                        onChange={(e) => {
                                                            const newItinerary = [...(formData.itinerary || [])];
                                                            newItinerary[index].title = e.target.value;
                                                            setFormData({ ...formData, itinerary: newItinerary });
                                                        }}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    />
                                                    <textarea
                                                        placeholder="Description"
                                                        value={day.description || ''}
                                                        onChange={(e) => {
                                                            const newItinerary = [...(formData.itinerary || [])];
                                                            newItinerary[index].description = e.target.value;
                                                            setFormData({ ...formData, itinerary: newItinerary });
                                                        }}
                                                        rows={2}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Activities (comma-separated)"
                                                        value={day.activities?.join(', ') || ''}
                                                        onChange={(e) => {
                                                            const newItinerary = [...(formData.itinerary || [])];
                                                            newItinerary[index].activities = e.target.value.split(',').map(a => a.trim()).filter(a => a);
                                                            setFormData({ ...formData, itinerary: newItinerary });
                                                        }}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Accommodation"
                                                        value={day.accommodation || ''}
                                                        onChange={(e) => {
                                                            const newItinerary = [...(formData.itinerary || [])];
                                                            newItinerary[index].accommodation = e.target.value;
                                                            setFormData({ ...formData, itinerary: newItinerary });
                                                        }}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    />
                                                    <div className="flex gap-4">
                                                        <label className="flex items-center gap-2 text-sm">
                                                            <input
                                                                type="checkbox"
                                                                checked={day.meals?.breakfast || false}
                                                                onChange={(e) => {
                                                                    const newItinerary = [...(formData.itinerary || [])];
                                                                    newItinerary[index].meals = { ...newItinerary[index].meals!, breakfast: e.target.checked };
                                                                    setFormData({ ...formData, itinerary: newItinerary });
                                                                }}
                                                                className="w-4 h-4"
                                                            />
                                                            Breakfast
                                                        </label>
                                                        <label className="flex items-center gap-2 text-sm">
                                                            <input
                                                                type="checkbox"
                                                                checked={day.meals?.lunch || false}
                                                                onChange={(e) => {
                                                                    const newItinerary = [...(formData.itinerary || [])];
                                                                    newItinerary[index].meals = { ...newItinerary[index].meals!, lunch: e.target.checked };
                                                                    setFormData({ ...formData, itinerary: newItinerary });
                                                                }}
                                                                className="w-4 h-4"
                                                            />
                                                            Lunch
                                                        </label>
                                                        <label className="flex items-center gap-2 text-sm">
                                                            <input
                                                                type="checkbox"
                                                                checked={day.meals?.dinner || false}
                                                                onChange={(e) => {
                                                                    const newItinerary = [...(formData.itinerary || [])];
                                                                    newItinerary[index].meals = { ...newItinerary[index].meals!, dinner: e.target.checked };
                                                                    setFormData({ ...formData, itinerary: newItinerary });
                                                                }}
                                                                className="w-4 h-4"
                                                            />
                                                            Dinner
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500 py-4">No itinerary days added yet</p>
                                    )}
                                    <button
                                        onClick={addItineraryDay}
                                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors flex items-center justify-center gap-2 font-medium"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Add Day
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Galleries */}
                        <div>
                            <SectionHeader title="🖼️ Visual Journeys (Gallery)" id="galleries" />
                            {expandedSection === 'galleries' && (
                                <div className="p-6 border border-gray-200 border-t-0 rounded-b-lg bg-gray-50 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Visual Journeys"
                                            value={formData.galleries?.[0]?.title || ''}
                                            onChange={(e) => {
                                                const galleries = [...(formData.galleries || [{ title: 'Visual Journeys', images: [] }])];
                                                galleries[0] = { ...galleries[0], title: e.target.value };
                                                setFormData({ ...formData, galleries });
                                            }}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images</label>
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

                                                                // Upload all files
                                                                for (const file of files) {
                                                                    const url = await uploadToCloudinary(file);
                                                                    newUrls.push(url);
                                                                }

                                                                // Update state
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
                                                                // Reset input value to allow selecting same files again if needed
                                                                input.value = '';
                                                            }
                                                        }
                                                    };
                                                    input.click();
                                                }}
                                                disabled={uploading.gallery}
                                                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all flex flex-col items-center justify-center gap-2 text-gray-600 disabled:opacity-50"
                                            >
                                                {uploading.gallery ? (
                                                    <>
                                                        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                                                        <span className="text-sm font-medium">Uploading images...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="p-3 bg-green-100 rounded-full text-green-600">
                                                            <Upload className="w-6 h-6" />
                                                        </div>
                                                        <div className="text-center">
                                                            <span className="font-medium text-green-600">Click to upload images</span>
                                                            <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 10MB)</p>
                                                        </div>
                                                    </>
                                                )}
                                            </button>

                                            {formData.galleries?.[0]?.images && formData.galleries[0].images.length > 0 && (
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {formData.galleries[0].images.map((img, idx) => (
                                                        <div key={idx} className="group relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                            <img
                                                                src={img}
                                                                alt={`Gallery ${idx + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <button
                                                                    onClick={() => {
                                                                        const galleries = [...(formData.galleries || [{ title: 'Visual Journeys', images: [] }])];
                                                                        const imageToDelete = galleries[0].images[idx];
                                                                        handleDeleteImage(imageToDelete);
                                                                        galleries[0].images = galleries[0].images.filter((_, i) => i !== idx);
                                                                        setFormData({ ...formData, galleries });
                                                                    }}
                                                                    className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors shadow-lg"
                                                                    title="Remove image"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Package List */}
            <div className="grid grid-cols-1 gap-4">
                {packages.map((pkg) => (
                    <div key={pkg._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h4 className="text-lg font-semibold text-gray-900">{pkg.packageName}</h4>
                                    {pkg.featured && <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full font-medium">⭐ Featured</span>}
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${pkg.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {pkg.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                    <strong>Category:</strong> {typeof pkg.tourCategory === 'object' ? (pkg.tourCategory as any).title : 'N/A'}
                                </p>
                                <p className="text-sm text-gray-600 mb-1">
                                    <strong>Duration:</strong> {pkg.overview.duration.days} Days | {pkg.overview.duration.nights} Nights
                                </p>
                                <p className="text-sm text-gray-700 mb-2">{pkg.hero.description}</p>
                                <p className="text-xs text-gray-500">Slug: <code className="bg-gray-100 px-2 py-1 rounded">{pkg.slug}</code></p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(pkg)}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(pkg._id!)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <PackageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No packages yet</p>
                    <p className="text-sm text-gray-500 mt-1">Click "Add Package" to create your first tour package</p>
                </div>
            )}
        </div>
    );
}
