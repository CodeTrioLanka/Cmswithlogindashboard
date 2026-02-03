import { useState, useEffect } from 'react';
import { FolderTree, Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { tourCategoriesService, type TourCategory } from '../../../services/tourCategories.service';
import { deleteFromCloudinary } from '../../../services/deleteApi';
import { toast } from 'sonner';
import { ImageUploadInput } from '../ui/ImageUploadInput';

export function TourCategoriesSection() {
    const [categories, setCategories] = useState<TourCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const [formData, setFormData] = useState<Partial<TourCategory>>({
        title: '',
        slug: '',
        description: '',
        isActive: true,
        displayOrder: 0,
        images: ['', '']
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setIsLoading(true);
            const { tours } = await tourCategoriesService.getTourCategories();
            console.log('Loaded categories:', tours);
            setCategories(tours);
        } catch (error) {
            console.error('Failed to load tour categories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleTitleChange = (title: string) => {
        const updates: Partial<TourCategory> = { title };
        if (!formData.slug || formData.slug === generateSlug(formData.title || '')) {
            updates.slug = generateSlug(title);
        }
        setFormData({ ...formData, ...updates });
    };

    const handleAdd = () => {
        setIsAdding(true);
        setFormData({
            title: '',
            slug: '',
            description: '',
            isActive: true,
            displayOrder: categories.length,
            images: ['', '']
        });
    };

    const handleEdit = (category: TourCategory) => {
        console.log('Editing category:', category);
        setEditingId(category._id!);
        setFormData(category);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({});
    };

    const handleSave = async () => {
        try {
            if (!formData.title || !formData.slug) {
                toast.error('Title and slug are required');
                return;
            }

            if (isAdding) {
                if (!formData.images || formData.images.length !== 2 || !formData.images[0] || !formData.images[1]) {
                    toast.error('Please upload exactly 2 images');
                    return;
                }
                console.log('Creating tour category with data:', formData);
                const response = await tourCategoriesService.createTourCategory(formData as Omit<TourCategory, '_id'>, []);
                console.log('Create response:', response);
                toast.success(response.message || 'Tour category created successfully!');
            } else if (editingId) {
                console.log('Updating tour category with data:', formData);
                console.log('Editing ID:', editingId);
                const response = await tourCategoriesService.updateTourCategory(editingId, formData, []);
                console.log('Update response:', response);
                toast.success(response.message || 'Tour category updated successfully!');
            }

            await loadCategories();
            handleCancel();
        } catch (error) {
            console.error('Failed to save tour category:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to save. Please try again.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this tour category?')) return;

        try {
            const response = await tourCategoriesService.deleteTourCategory(id);
            toast.success(response.message || 'Tour category deleted successfully!');
            await loadCategories();
        } catch (error) {
            console.error('Failed to delete tour category:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to delete. Please try again.');
        }
    };

    const handleImageUpdate = async (index: number, newUrl: string) => {
        const oldUrl = formData.images?.[index];
        if (oldUrl && oldUrl !== newUrl && oldUrl.includes('cloudinary')) {
            await deleteFromCloudinary(oldUrl);
        }

        const newImages = [...(formData.images || ['', ''])];
        newImages[index] = newUrl;
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    if (isLoading) {
        return <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tour Categories</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage tour categories like Beach, Cultural, Honeymoon, etc.</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-700 to-emerald-600 text-white rounded-lg hover:from-green-800 hover:to-emerald-700 transition-all shadow-md font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Add Category
                    </button>
                )}
            </div>

            {/* Add Form */}
            {isAdding && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <FolderTree className="w-5 h-5 text-green-600 dark:text-green-500" />
                            <h4 className="font-semibold text-gray-900 dark:text-white">New Category</h4>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                            >
                                <Save className="w-4 h-4" />
                                Save
                            </button>
                            <button
                                onClick={handleCancel}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-medium"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
                            <input
                                type="text"
                                value={formData.title || ''}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="e.g., BEACH TOURS"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Slug *</label>
                            <input
                                type="text"
                                value={formData.slug || ''}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="e.g., beach"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Category description"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Display Order</label>
                            <input
                                type="number"
                                value={formData.displayOrder || 0}
                                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="flex items-center">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-green-600 dark:text-green-500 rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                            </label>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Images (2 required) *</label>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Image 1 */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Image 1</label>
                                    <ImageUploadInput
                                        value={formData.images?.[0] || ''}
                                        onChange={(url) => handleImageUpdate(0, url)}
                                        placeholder="Image URL"
                                    />
                                    {formData.images?.[0] && (
                                        <div className="image-preview-square mt-2">
                                            <img src={formData.images[0]} alt="Preview 1" />
                                        </div>
                                    )}
                                </div>

                                {/* Image 2 */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Image 2</label>
                                    <ImageUploadInput
                                        value={formData.images?.[1] || ''}
                                        onChange={(url) => handleImageUpdate(1, url)}
                                        placeholder="Image URL"
                                    />
                                    {formData.images?.[1] && (
                                        <div className="image-preview-square mt-2">
                                            <img src={formData.images[1]} alt="Preview 2" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {categories.map((category) => (
                    <div key={category._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                        {editingId === category._id ? (
                            // Edit mode
                            <>
                                <div className="flex items-center justify-between mb-5">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Edit Category</h4>
                                    <div className="flex gap-2">
                                        <button onClick={handleSave} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                            <Save className="w-4 h-4" />
                                            Save
                                        </button>
                                        <button onClick={handleCancel} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-medium">
                                            <X className="w-4 h-4" />
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                                        <input type="text" value={formData.title || ''} onChange={(e) => handleTitleChange(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Slug</label>
                                        <input type="text" value={formData.slug || ''} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                        <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Display Order</label>
                                        <input
                                            type="number"
                                            value={formData.displayOrder || 0}
                                            onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                className="w-4 h-4 text-green-600 dark:text-green-500 rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                                        </label>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Images (2 required) *</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Image 1 */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Image 1</label>
                                                <ImageUploadInput
                                                    value={formData.images?.[0] || ''}
                                                    onChange={(url) => handleImageUpdate(0, url)}
                                                    placeholder="Image URL"
                                                />
                                                {formData.images?.[0] && (
                                                    <div className="image-preview-square mt-2">
                                                        <img src={formData.images[0]} alt="Preview 1" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Image 2 */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Image 2</label>
                                                <ImageUploadInput
                                                    value={formData.images?.[1] || ''}
                                                    onChange={(url) => handleImageUpdate(1, url)}
                                                    placeholder="Image URL"
                                                />
                                                {formData.images?.[1] && (
                                                    <div className="image-preview-square mt-2">
                                                        <img src={formData.images[1]} alt="Preview 2" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            // View mode
                            <>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{category.title}</h4>
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${category.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'}`}>
                                                {category.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Slug: <code className="bg-gray-100 dark:bg-gray-900/50 px-2 py-1 rounded">{category.slug}</code></p>
                                        {category.description && <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{category.description}</p>}
                                        <div className="flex gap-3">
                                            {category.images.map((img, idx) => (
                                                <div key={idx} className="image-preview-square">
                                                    <img src={img} alt={`${category.title} ${idx + 1}`} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(category)} className="p-2 text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(category._id!)} className="p-2 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {categories.length === 0 && !isAdding && (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <FolderTree className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium">No tour categories yet. Click "Add Category" to create one.</p>
                </div>
            )}
        </div>
    );
}
