import { Home, Image, BarChart3, Save, Plus, X, Edit, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchHomeData, updateHomeData } from "../../../services/homeApi";
import { uploadToCloudinary, uploadMultipleToCloudinary } from "../../../services/cloudinaryApi";
import { deleteFromCloudinary } from "../../../services/deleteApi";
import { toast } from "sonner";

const BASE_URL = "http://localhost:5000";
//dynamic by senuda adihetty
interface HomeData {
  _id?: string;
  title: string;
  subtitle: string;
  year_of_exp: number;
  expert_Team_members: number;
  total_tours: number;
  happy_travelers: number;
  homebg: string;
  destinationImage: string;
  personalizedImage: string;
  gallery: string[];
}

export function HomeSection() {
  const [homeData, setHomeData] = useState<HomeData>({
    title: "",
    subtitle: "",
    year_of_exp: 0,
    expert_Team_members: 0,
    total_tours: 0,
    happy_travelers: 0,
    homebg: "",
    destinationImage: "",
    personalizedImage: "",
    gallery: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [originalData, setOriginalData] = useState<HomeData | null>(null);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const data = await fetchHomeData();
        if (data) {
          setHomeData(data);
          setOriginalData(data); // Store original data for comparison
        }
      } catch (error) {
        console.error("Failed to load home data:", error);
      }
    };
    loadHomeData();
  }, []);

  const handleCancel = () => {
    setHomeData(originalData || {
      title: "",
      subtitle: "",
      year_of_exp: 0,
      expert_Team_members: 0,
      total_tours: 0,
      happy_travelers: 0,
      homebg: "",
      destinationImage: "",
      personalizedImage: "",
      gallery: [],
    });
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setHomeData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = async (field: string, file: File | File[]) => {
    // Store old image URL for deletion
    const oldImageUrl = field === 'gallery' ? null : homeData[field as keyof HomeData] as string;
    
    // Auto-upload to Cloudinary
    setUploading((prev) => ({ ...prev, [field]: true }));
    try {
      if (Array.isArray(file)) {
        const urls = await uploadMultipleToCloudinary(file);
        if (field === 'gallery') {
          setHomeData((prev) => ({ ...prev, gallery: [...prev.gallery, ...urls] }));
        }
        toast.success(`${urls.length} images uploaded successfully!`);
      } else {
        const url = await uploadToCloudinary(file);
        
        // Delete old image if it exists and is different
        if (oldImageUrl && oldImageUrl !== url && oldImageUrl.includes('cloudinary')) {
          await deleteFromCloudinary(oldImageUrl);
        }
        
        setHomeData((prev) => ({ ...prev, [field]: url }));
        toast.success('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const createFileInput = (field: string, multiple = false) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = multiple;
    input.onchange = (e) => {
      const selectedFiles = (e.target as HTMLInputElement).files;
      if (selectedFiles) {
        if (multiple) {
          handleFileSelect(field, Array.from(selectedFiles));
        } else {
          handleFileSelect(field, selectedFiles[0]);
        }
      }
    };
    input.click();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const dataToSend = {
        ...homeData,
        gallery: homeData.gallery // Include gallery array
      };

      if (homeData._id) {
        // For updates, send the data directly since images are already uploaded to Cloudinary
        const response = await fetch(`${BASE_URL}/api/home/${homeData._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });
        if (!response.ok) throw new Error('Failed to update');
      } else {
        // Create new data
        const response = await fetch(`${BASE_URL}/api/home`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });
        if (!response.ok) throw new Error('Failed to create');
      }

      const data = await fetchHomeData();
      if (data) {
        setHomeData(data);
      }
      setIsEditing(false);
      toast.success(homeData._id ? 'Updated successfully!' : 'Created successfully!');
    } catch (error) {
      console.error('Error saving home data:', error);
      toast.error('Error saving data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Home Page Settings</h2>
        <div className="flex gap-2">
          {isEditing && (
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-all"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
          <button
            onClick={isEditing ? handleSubmit : () => setIsEditing(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            {loading ? "Saving..." : isEditing ? "Save" : "Edit"}
          </button>
        </div>
      </div>
    
      {/* Hero Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Home className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Hero Section</h3>
        </div>
        <div className="grid grid-cols-1 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={homeData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              readOnly={!isEditing}
              className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Enter main title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle
            </label>
            <textarea
              value={homeData.subtitle}
              onChange={(e) => handleInputChange("subtitle", e.target.value)}
              readOnly={!isEditing}
              rows={3}
              className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Enter subtitle"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Image
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={homeData.homebg}
                onChange={(e) => handleInputChange("homebg", e.target.value)}
                readOnly={!isEditing}
                className={`flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="Background image URL"
              />
              <button
                type="button"
                onClick={() => createFileInput("homebg")}
                disabled={!isEditing || uploading.homebg}
                className={`px-4 py-2.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2 ${!isEditing || uploading.homebg ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {uploading.homebg ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading.homebg ? 'Uploading...' : 'Browse'}
              </button>
            </div>
            {homeData.homebg && (
              <div className="mt-2">
                <img
                  src={homeData.homebg}
                  alt="Background preview"
                  className="w-32 h-auto rounded border"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Statistics</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Experience
            </label>
            <input
              type="number"
              value={homeData.year_of_exp}
              onChange={(e) =>
                handleInputChange("year_of_exp", parseInt(e.target.value) || 0)
              }
              readOnly={!isEditing}
              className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expert Team Members
            </label>
            <input
              type="number"
              value={homeData.expert_Team_members}
              onChange={(e) =>
                handleInputChange(
                  "expert_Team_members",
                  parseInt(e.target.value) || 0,
                )
              }
              readOnly={!isEditing}
              className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Tours
            </label>
            <input
              type="number"
              value={homeData.total_tours}
              onChange={(e) =>
                handleInputChange("total_tours", parseInt(e.target.value) || 0)
              }
              readOnly={!isEditing}
              className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Happy Travelers
            </label>
            <input
              type="number"
              value={homeData.happy_travelers}
              onChange={(e) =>
                handleInputChange(
                  "happy_travelers",
                  parseInt(e.target.value) || 0,
                )
              }
              readOnly={!isEditing}
              className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Featured Images */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Image className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Featured Images
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination Image
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={homeData.destinationImage}
                onChange={(e) =>
                  handleInputChange("destinationImage", e.target.value)
                }
                readOnly={!isEditing}
                className={`flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="Image URL"
              />
              <button
                type="button"
                onClick={() => createFileInput("destinationImage")}
                disabled={!isEditing || uploading.destinationImage}
                className={`px-4 py-2.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2 ${!isEditing || uploading.destinationImage ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {uploading.destinationImage ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading.destinationImage ? 'Uploading...' : 'Browse'}
              </button>
            </div>
            {homeData.destinationImage && (
              <img
                src={homeData.destinationImage}
                alt="Destination preview"
                className="w-full h-auto rounded border"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personalized Image
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={homeData.personalizedImage}
                onChange={(e) =>
                  handleInputChange("personalizedImage", e.target.value)
                }
                readOnly={!isEditing}
                className={`flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="Image URL"
              />
              <button
                type="button"
                onClick={() => createFileInput("personalizedImage")}
                disabled={!isEditing || uploading.personalizedImage}
                className={`px-4 py-2.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2 ${!isEditing || uploading.personalizedImage ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {uploading.personalizedImage ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading.personalizedImage ? 'Uploading...' : 'Browse'}
              </button>
            </div>
            {homeData.personalizedImage && (
              <img
                src={homeData.personalizedImage}
                alt="Personalized preview"
                className="w-full h-auto rounded border"
              />
            )}
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Gallery</h3>
          </div>
          <button
            type="button"
            onClick={() => createFileInput("gallery", true)}
            disabled={!isEditing || uploading.gallery}
            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all ${!isEditing || uploading.gallery ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {uploading.gallery ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {uploading.gallery ? 'Uploading...' : 'Add Images'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {homeData.gallery.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Gallery ${index + 1}`}
                className="w-full h-32 object-cover rounded border"
              />
              {isEditing && (
                <button
                  onClick={async () => {
                    const imageToDelete = homeData.gallery[index];
                    const newGallery = homeData.gallery.filter((_, i) => i !== index);
                    setHomeData((prev) => ({ ...prev, gallery: newGallery }));
                    
                    // Delete from Cloudinary
                    if (imageToDelete.includes('cloudinary')) {
                      await deleteFromCloudinary(imageToDelete);
                    }
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                {image}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
