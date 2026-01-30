import { useState, useEffect } from 'react';
import { Package as PackageIcon, Plus, Trash2, Edit, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { packagesService, type Package } from '../../../services/packages.service';
import { tourCategoriesService, type TourCategory } from '../../../services/tourCategories.service';

export function PackagesSection() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [categories, setCategories] = useState<TourCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [expandedSection, setExpandedSection] = useState<string>('basic');

    const [formData, setFormData] = useState<Partial<Package>>({
        packageName: '',
        slug: '',
        tourCategory: '',
        hero: { title: '', subtitle: '', description: '', backgroundImage: '' },
        overview: {
            duration: { days: 0, nights: 0 },
            groupSize: '',
            difficulty: 'Easy',
            price: { amount: 0, currency: 'USD' }
        },
        itinerary: [],
        galleries: [{ title: 'Gallery', images: [] }],
        attractions: [],
        needToKnow: { title: 'Need to Know', items: [] },
        map: { image: '', description: '' },
        included: [],
        excluded: [],
        recommendedFor: [],
        relatedPackages: [],
        isActive: true,
        featured: false,
        displayOrder: 0
    });

    const [files, setFiles] = useState<{
        heroBackground?: File;
        mapImage?: File;
        galleryImages?: File[];
        attractionImages?: File[];
    }>({});

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
            setPackages(packagesData.packages);
            setCategories(categoriesData.tours);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = () => {
        setIsAdding(true);
        setExpandedSection('basic');
    };

    const handleEdit = (pkg: Package) => {
        setEditingId(pkg._id!);
        setFormData(pkg);
        setExpandedSection('basic');
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({});
        setFiles({});
    };

    const handleSave = async () => {
        try {
            if (!formData.packageName || !formData.slug) {
                alert('Package name and slug are required');
                return;
            }

            if (!formData.tourCategory) {
                alert('Tour category is required');
                return;
            }

            if (!formData.hero?.title) {
                alert('Hero title is required');
                return;
            }

            if (isAdding) {
                await packagesService.createPackage(formData as Omit<Package, '_id'>, files);
                alert('Package created successfully!');
            } else if (editingId) {
                await packagesService.updatePackage(editingId, formData, files);
                alert('Package updated successfully!');
            }

            await loadData();
            handleCancel();
        } catch (error: any) {
            console.error('Failed to save package:', error);

            // Extract error message from response
            let errorMessage = 'Failed to save package. Please try again.';

            if (error?.message) {
                if (error.message.includes('duplicate') || error.message.includes('slug')) {
                    errorMessage = 'This slug already exists. Please use a unique slug.';
                } else if (error.message.includes('required')) {
                    errorMessage = 'Please fill in all required fields.';
                } else {
                    errorMessage = error.message;
                }
            }

            alert(errorMessage);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this package?')) return;

        try {
            await packagesService.deletePackage(id);
            await loadData();
        } catch (error) {
            console.error('Failed to delete package:', error);
            alert('Failed to delete. Please try again.');
        }
    };

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? '' : section);
    };

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

    const addAttraction = () => {
        setFormData({
            ...formData,
            attractions: [
                ...(formData.attractions || []),
                { title: '', description: '', image: '' }
            ]
        });
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    const SectionHeader = ({ title, id }: { title: string; id: string }) => (
        <button
            onClick={() => toggleSection(id)}
            className="w-full flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
        >
            <h5 className="font-semibold text-gray-900">{title}</h5>
            {expandedSection === id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Tour Packages</h3>
                    <p className="text-sm text-gray-600 mt-1">Manage detailed tour packages</p>
                </div>
                {!isAdding && !editingId && (
                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Add Package
                    </button>
                )}
            </div>

            {/* Add/Edit Form */}
            {(isAdding || editingId) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-semibold text-gray-900 text-lg">
                            {isAdding ? 'New Package' : 'Edit Package'}
                        </h4>
                        <div className="flex gap-2">
                            <button onClick={handleSave} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                <Save className="w-4 h-4" />
                                Save
                            </button>
                            <button onClick={handleCancel} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Basic Info */}
                        <div>
                            <SectionHeader title="Basic Information" id="basic" />
                            {expandedSection === 'basic' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-b-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Package Name *</label>
                                        <input
                                            type="text"
                                            value={formData.packageName || ''}
                                            onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                                            placeholder="e.g., Eastern Blue Bliss"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                                        <input
                                            type="text"
                                            value={formData.slug || ''}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                                            placeholder="e.g., eastern-blue-bliss"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tour Category *</label>
                                        <select
                                            value={formData.tourCategory || ''}
                                            onChange={(e) => setFormData({ ...formData, tourCategory: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
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
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm font-medium">Active</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.featured}
                                                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm font-medium">Featured</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Hero Section */}
                        <div>
                            <SectionHeader title="Hero Section" id="hero" />
                            {expandedSection === 'hero' && (
                                <div className="grid grid-cols-1 gap-4 p-4 border border-gray-200 rounded-b-lg">
                                    <input
                                        type="text"
                                        placeholder="Hero Title"
                                        value={formData.hero?.title || ''}
                                        onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero!, title: e.target.value } })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Subtitle (e.g., 5 DAYS | 4 NIGHTS)"
                                        value={formData.hero?.subtitle || ''}
                                        onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero!, subtitle: e.target.value } })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                                    />
                                    <textarea
                                        placeholder="Hero Description"
                                        value={formData.hero?.description || ''}
                                        onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero!, description: e.target.value } })}
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                                    />
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Hero Background Image</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setFiles({ ...files, heroBackground: e.target.files?.[0] })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Overview */}
                        <div>
                            <SectionHeader title="Overview Details" id="overview" />
                            {expandedSection === 'overview' && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-b-lg">
                                    <input
                                        type="number"
                                        placeholder="Days"
                                        value={formData.overview?.duration?.days || 0}
                                        onChange={(e) => setFormData({ ...formData, overview: { ...formData.overview!, duration: { ...formData.overview!.duration, days: parseInt(e.target.value) } } })}
                                        className="px-4 py-2.5 border rounded-lg"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Nights"
                                        value={formData.overview?.duration?.nights || 0}
                                        onChange={(e) => setFormData({ ...formData, overview: { ...formData.overview!, duration: { ...formData.overview!.duration, nights: parseInt(e.target.value) } } })}
                                        className="px-4 py-2.5 border rounded-lg"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Group Size (e.g., 2-15)"
                                        value={formData.overview?.groupSize || ''}
                                        onChange={(e) => setFormData({ ...formData, overview: { ...formData.overview!, groupSize: e.target.value } })}
                                        className="px-4 py-2.5 border rounded-lg"
                                    />
                                    <select
                                        value={formData.overview?.difficulty || 'Easy'}
                                        onChange={(e) => setFormData({ ...formData, overview: { ...formData.overview!, difficulty: e.target.value as any } })}
                                        className="px-4 py-2.5 border rounded-lg"
                                    >
                                        <option>Easy</option>
                                        <option>Moderate</option>
                                        <option>Challenging</option>
                                        <option>Difficult</option>
                                    </select>
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={formData.overview?.price?.amount || 0}
                                        onChange={(e) => setFormData({ ...formData, overview: { ...formData.overview!, price: { amount: parseInt(e.target.value), currency: formData.overview?.price?.currency || 'USD' } } })}
                                        className="px-4 py-2.5 border rounded-lg"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Currency"
                                        value={formData.overview?.price?.currency || 'USD'}
                                        onChange={(e) => setFormData({ ...formData, overview: { ...formData.overview!, price: { amount: formData.overview?.price?.amount || 0, currency: e.target.value } } })}
                                        className="px-4 py-2.5 border rounded-lg"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Quick Sections */}
                        <div>
                            <SectionHeader title="Included/Excluded & Recommendations" id="lists" />
                            {expandedSection === 'lists' && (
                                <div className="p-4 border border-gray-200 rounded-b-lg space-y-3">
                                    <p className="text-sm text-gray-600">Add items separated by commas</p>
                                    <textarea
                                        placeholder="Included items (comma-separated)"
                                        value={formData.included?.join(', ') || ''}
                                        onChange={(e) => setFormData({ ...formData, included: e.target.value.split(',').map(i => i.trim()) })}
                                        rows={2}
                                        className="w-full px-4 py-2.5 border rounded-lg"
                                    />
                                    <textarea
                                        placeholder="Excluded items (comma-separated)"
                                        value={formData.excluded?.join(', ') || ''}
                                        onChange={(e) => setFormData({ ...formData, excluded: e.target.value.split(',').map(i => i.trim()) })}
                                        rows={2}
                                        className="w-full px-4 py-2.5 border rounded-lg"
                                    />
                                    <textarea
                                        placeholder="Recommended for (comma-separated)"
                                        value={formData.recommendedFor?.join(', ') || ''}
                                        onChange={(e) => setFormData({ ...formData, recommendedFor: e.target.value.split(',').map(i => i.trim()) })}
                                        rows={2}
                                        className="w-full px-4 py-2.5 border rounded-lg"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Visual Journeys (Galleries) */}
                        <div>
                            <SectionHeader title="Visual Journeys (Galleries)" id="galleries" />
                            {expandedSection === 'galleries' && (
                                <div className="p-4 border border-gray-200 rounded-b-lg space-y-4">
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
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Gallery Images</label>
                                        <div
                                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50"
                                            onClick={() => document.getElementById('gallery-upload')?.click()}
                                        >
                                            <input
                                                id="gallery-upload"
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={(e) => {
                                                    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
                                                    const existingFiles = files.galleryImages || [];
                                                    setFiles({ ...files, galleryImages: [...existingFiles, ...selectedFiles] });
                                                }}
                                                className="hidden"
                                            />
                                            <div className="space-y-2">
                                                <p className="text-gray-600 font-medium">Click to upload or drag and drop</p>
                                                <p className="text-sm text-gray-500">Select multiple images at once</p>
                                                <p className="text-xs text-gray-400">PNG, JPG, JPEG up to 10MB each</p>
                                            </div>
                                        </div>
                                    </div>
                                    {files.galleryImages && files.galleryImages.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">{files.galleryImages.length} image(s) selected</p>
                                            <div className="grid grid-cols-4 gap-3">
                                                {files.galleryImages.map((file, idx) => (
                                                    <div key={idx} className="relative group">
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt={`Gallery ${idx + 1}`}
                                                            className="w-full h-24 object-cover rounded-lg border"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newFiles = files.galleryImages?.filter((_, i) => i !== idx);
                                                                setFiles({ ...files, galleryImages: newFiles });
                                                            }}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            ×
                                                        </button>
                                                        <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Package List */}
            <div className="grid grid-cols-1 gap-4">
                {packages.map((pkg) => (
                    <div key={pkg._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h4 className="text-lg font-semibold">{pkg.packageName}</h4>
                                    {pkg.featured && <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">Featured</span>}
                                    <span className={`px-2 py-1 text-xs rounded-full ${pkg.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                                        {pkg.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">Category: {typeof pkg.tourCategory === 'object' ? (pkg.tourCategory as any).title : 'N/A'}</p>
                                <p className="text-sm text-gray-700 mb-2">{pkg.hero.subtitle}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(pkg)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(pkg._id!)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {packages.length === 0 && !isAdding && !editingId && (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                    <PackageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No packages yet. Click "Add Package" to create one.</p>
                </div>
            )}
        </div>
    );
}
