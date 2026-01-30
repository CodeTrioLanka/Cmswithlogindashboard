import { useState, useEffect } from 'react';
import { FolderTree, Plus, Trash2, Edit, Save, X, Image as ImageIcon, Upload } from 'lucide-react';
import { tourCategoriesService, type TourCategory } from '../../../services/tourCategories.service';
import { uploadToCloudinary } from '../../../services/cloudinaryApi';
import { deleteFromCloudinary } from '../../../services/deleteApi';
import { toast } from 'sonner';

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

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState<{ [key: number]: boolean }>({});

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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 2) {
            alert('Maximum 2 images allowed');
            return;
        }

        setImageFiles(files);

        // Create previews
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
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
        setImageFiles([]);
        setImagePreviews([]);
    };

    const handleEdit = (category: TourCategory) => {
        console.log('Editing category:', category);
        setEditingId(category._id!);
        setFormData(category);
        setImagePreviews(category.images);
        setImageFiles([]);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({});
        setImageFiles([]);
        setImagePreviews([]);
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
                // Images are already Cloudinary URLs in formData
                const response = await tourCategoriesService.createTourCategory(formData as Omit<TourCategory, '_id'>, []);
                console.log('Create response:', response);
                toast.success(response.message || 'Tour category created successfully!');
            } else if (editingId) {
                console.log('Updating tour category with data:', formData);
                console.log('Editing ID:', editingId);
                // Images are already Cloudinary URLs in formData
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

    if (isLoading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Tour Categories</h3>
                    <p className="text-sm text-gray-600 mt-1">Manage tour categories like Beach, Cultural, Honeymoon, etc.</p>
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <FolderTree className="w-5 h-5 text-green-600" />
                            <h4 className="font-semibold text-gray-900">New Category</h4>
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
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                            <input
                                type="text"
                                value={formData.title || ''}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="e.g., BEACH TOURS"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                            <input
                                type="text"
                                value={formData.slug || ''}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="e.g., beach"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                placeholder="Category description"
                            />
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

                        <div className="flex items-center">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-green-600 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700">Active</span>
                            </label>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-3">Images (2 required) *</label>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Image 1 */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-2">Image 1</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={formData.images?.[0] || ''}
                                            onChange={(e) => {
                                                const newImages = [...(formData.images || ['', ''])];
                                                newImages[0] = e.target.value;
                                                setFormData({ ...formData, images: newImages });
                                            }}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            placeholder="Image URL"
                                        />
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const input = document.createElement('input');
                                                input.type = 'file';
                                                input.accept = 'image/*';
                                                input.onchange = async (e) => {
                                                    const file = (e.target as HTMLInputElement).files?.[0];
                                                    if (file) {
                                                        // Show uploading state
                                                        setUploading(prev => ({ ...prev, 0: true }));

                                                        try {
                                                            // Store old image URL for deletion
                                                            const oldImageUrl = formData.images?.[0];

                                                            // Upload to Cloudinary
                                                            const url = await uploadToCloudinary(file);

                                                            // Delete old image if it exists and is from Cloudinary
                                                            if (oldImageUrl && oldImageUrl !== url && oldImageUrl.includes('cloudinary')) {
                                                                await deleteFromCloudinary(oldImageUrl);
                                                            }

                                                            // Update form data with Cloudinary URL (using functional setState)
                                                            setFormData(prev => {
                                                                const currentImages = prev.images || ['', ''];
                                                                return { ...prev, images: [url, currentImages[1] || ''] };
                                                            });

                                                            // Set preview
                                                            setImagePreviews(prev => {
                                                                const currentPreviews = prev || ['', ''];
                                                                return [url, currentPreviews[1] || ''];
                                                            });
                                                        } catch (error) {
                                                            console.error('Upload failed:', error);
                                                            toast.error('Failed to upload image. Please try again.');
                                                        } finally {
                                                            setUploading(prev => ({ ...prev, 0: false }));
                                                        }
                                                    }
                                                };
                                                input.click();
                                            }}
                                            disabled={uploading[0]}
                                            className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm hover:bg-gray-200 flex items-center gap-1 disabled:opacity-50"
                                        >
                                            {uploading[0] ? (
                                                <>
                                                    <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                    <span>Uploading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-3 h-3" />
                                                    Browse
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    {imagePreviews[0] && (
                                        <img src={imagePreviews[0]} alt="Preview 1" className="mt-2 w-full h-32 object-cover rounded-lg border" />
                                    )}
                                </div>

                                {/* Image 2 */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-2">Image 2</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={formData.images?.[1] || ''}
                                            onChange={(e) => {
                                                const newImages = [...(formData.images || ['', ''])];
                                                newImages[1] = e.target.value;
                                                setFormData({ ...formData, images: newImages });
                                            }}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            placeholder="Image URL"
                                        />
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const input = document.createElement('input');
                                                input.type = 'file';
                                                input.accept = 'image/*';
                                                input.onchange = async (e) => {
                                                    const file = (e.target as HTMLInputElement).files?.[0];
                                                    if (file) {
                                                        // Show uploading state
                                                        setUploading(prev => ({ ...prev, 1: true }));

                                                        try {
                                                            // Store old image URL for deletion
                                                            const oldImageUrl = formData.images?.[1];

                                                            // Upload to Cloudinary
                                                            const url = await uploadToCloudinary(file);

                                                            // Delete old image if it exists and is from Cloudinary
                                                            if (oldImageUrl && oldImageUrl !== url && oldImageUrl.includes('cloudinary')) {
                                                                await deleteFromCloudinary(oldImageUrl);
                                                            }

                                                            // Update form data with Cloudinary URL (using functional setState)
                                                            setFormData(prev => {
                                                                const currentImages = prev.images || ['', ''];
                                                                return { ...prev, images: [currentImages[0] || '', url] };
                                                            });

                                                            // Set preview
                                                            setImagePreviews(prev => {
                                                                const currentPreviews = prev || ['', ''];
                                                                return [currentPreviews[0] || '', url];
                                                            });
                                                        } catch (error) {
                                                            console.error('Upload failed:', error);
                                                            toast.error('Failed to upload image. Please try again.');
                                                        } finally {
                                                            setUploading(prev => ({ ...prev, 1: false }));
                                                        }
                                                    }
                                                };
                                                input.click();
                                            }}
                                            disabled={uploading[1]}
                                            className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm hover:bg-gray-200 flex items-center gap-1 disabled:opacity-50"
                                        >
                                            {uploading[1] ? (
                                                <>
                                                    <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                    <span>Uploading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-3 h-3" />
                                                    Browse
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    {imagePreviews[1] && (
                                        <img src={imagePreviews[1]} alt="Preview 2" className="mt-2 w-full h-32 object-cover rounded-lg border" />
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
                    <div key={category._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        {editingId === category._id ? (
                            // Edit mode
                            <>
                                <div className="flex items-center justify-between mb-5">
                                    <h4 className="font-semibold text-gray-900">Edit Category</h4>
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                        <input type="text" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                                        <input type="text" value={formData.slug || ''} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                        <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" />
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

                                    <div className="flex items-center">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                className="w-4 h-4 text-green-600 rounded"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Active</span>
                                        </label>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Images (2 required) *</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Image 1 */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-2">Image 1</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="url"
                                                        value={formData.images?.[0] || ''}
                                                        onChange={(e) => {
                                                            const newImages = [...(formData.images || ['', ''])];
                                                            newImages[0] = e.target.value;
                                                            setFormData({ ...formData, images: newImages });
                                                            setImagePreviews(prev => {
                                                                const currentPreviews = prev || ['', ''];
                                                                return [e.target.value, currentPreviews[1] || ''];
                                                            });
                                                        }}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                        placeholder="Image URL"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            const input = document.createElement('input');
                                                            input.type = 'file';
                                                            input.accept = 'image/*';
                                                            input.onchange = async (e) => {
                                                                const file = (e.target as HTMLInputElement).files?.[0];
                                                                if (file) {
                                                                    setUploading(prev => ({ ...prev, 0: true }));
                                                                    try {
                                                                        // Store old image URL for deletion
                                                                        const oldImageUrl = formData.images?.[0];

                                                                        const url = await uploadToCloudinary(file);

                                                                        // Delete old image if it exists and is from Cloudinary
                                                                        if (oldImageUrl && oldImageUrl !== url && oldImageUrl.includes('cloudinary')) {
                                                                            await deleteFromCloudinary(oldImageUrl);
                                                                        }

                                                                        setFormData(prev => {
                                                                            const currentImages = prev.images || ['', ''];
                                                                            return { ...prev, images: [url, currentImages[1] || ''] };
                                                                        });
                                                                        setImagePreviews(prev => {
                                                                            const currentPreviews = prev || ['', ''];
                                                                            return [url, currentPreviews[1] || ''];
                                                                        });
                                                                        toast.success('Image 1 uploaded successfully!');
                                                                    } catch (error) {
                                                                        console.error('Upload failed:', error);
                                                                        toast.error('Failed to upload image. Please try again.');
                                                                    } finally {
                                                                        setUploading(prev => ({ ...prev, 0: false }));
                                                                    }
                                                                }
                                                            };
                                                            input.click();
                                                        }}
                                                        disabled={uploading[0]}
                                                        className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm hover:bg-gray-200 flex items-center gap-1 disabled:opacity-50"
                                                    >
                                                        {uploading[0] ? (
                                                            <>
                                                                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                                <span>Uploading...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload className="w-3 h-3" />
                                                                Browse
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                                {imagePreviews[0] && (
                                                    <img src={imagePreviews[0]} alt="Preview 1" className="mt-2 w-full h-32 object-cover rounded-lg border" />
                                                )}
                                            </div>

                                            {/* Image 2 */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-2">Image 2</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="url"
                                                        value={formData.images?.[1] || ''}
                                                        onChange={(e) => {
                                                            const newImages = [...(formData.images || ['', ''])];
                                                            newImages[1] = e.target.value;
                                                            setFormData({ ...formData, images: newImages });
                                                            setImagePreviews(prev => {
                                                                const currentPreviews = prev || ['', ''];
                                                                return [currentPreviews[0] || '', e.target.value];
                                                            });
                                                        }}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                        placeholder="Image URL"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            const input = document.createElement('input');
                                                            input.type = 'file';
                                                            input.accept = 'image/*';
                                                            input.onchange = async (e) => {
                                                                const file = (e.target as HTMLInputElement).files?.[0];
                                                                if (file) {
                                                                    setUploading(prev => ({ ...prev, 1: true }));
                                                                    try {
                                                                        // Store old image URL for deletion
                                                                        const oldImageUrl = formData.images?.[1];

                                                                        const url = await uploadToCloudinary(file);

                                                                        // Delete old image if it exists and is from Cloudinary
                                                                        if (oldImageUrl && oldImageUrl !== url && oldImageUrl.includes('cloudinary')) {
                                                                            await deleteFromCloudinary(oldImageUrl);
                                                                        }

                                                                        setFormData(prev => {
                                                                            const currentImages = prev.images || ['', ''];
                                                                            return { ...prev, images: [currentImages[0] || '', url] };
                                                                        });
                                                                        setImagePreviews(prev => {
                                                                            const currentPreviews = prev || ['', ''];
                                                                            return [currentPreviews[0] || '', url];
                                                                        });
                                                                        toast.success('Image 2 uploaded successfully!');
                                                                    } catch (error) {
                                                                        console.error('Upload failed:', error);
                                                                        toast.error('Failed to upload image. Please try again.');
                                                                    } finally {
                                                                        setUploading(prev => ({ ...prev, 1: false }));
                                                                    }
                                                                }
                                                            };
                                                            input.click();
                                                        }}
                                                        disabled={uploading[1]}
                                                        className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm hover:bg-gray-200 flex items-center gap-1 disabled:opacity-50"
                                                    >
                                                        {uploading[1] ? (
                                                            <>
                                                                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                                <span>Uploading...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload className="w-3 h-3" />
                                                                Browse
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                                {imagePreviews[1] && (
                                                    <img src={imagePreviews[1]} alt="Preview 2" className="mt-2 w-full h-32 object-cover rounded-lg border" />
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
                                            <h4 className="text-lg font-semibold text-gray-900">{category.title}</h4>
                                            <span className={`px-2 py-1 text-xs rounded-full ${category.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {category.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">Slug: <code className="bg-gray-100 px-2 py-1 rounded">{category.slug}</code></p>
                                        {category.description && <p className="text-sm text-gray-700 mb-4">{category.description}</p>}
                                        <div className="flex gap-3">
                                            {category.images.map((img, idx) => (
                                                <img key={idx} src={img} alt={`${category.title} ${idx + 1}`} className="w-24 h-24 object-cover rounded-lg border" />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(category)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(category._id!)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
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
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <FolderTree className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No tour categories yet. Click "Add Category" to create one.</p>
                </div>
            )}
        </div>
    );
}
