import { Home, Image, BarChart3, Save, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const BASE_URL = 'http://localhost:5000';
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
    title: '',
    subtitle: '',
    year_of_exp: 0,
    expert_Team_members: 0,
    total_tours: 0,
    happy_travelers: 0,
    homebg: '',
    destinationImage: '',
    personalizedImage: '',
    gallery: []
  });
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<{[key: string]: File | File[]}>({});

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/home`);
      const data = await response.json();
      if (data.homes && data.homes.length > 0) {
        setHomeData(data.homes[0]);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setHomeData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (field: string, file: File | File[]) => {
    setFiles(prev => ({ ...prev, [field]: file }));
  };

  const createFileInput = (field: string, multiple = false) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
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
      const formData = new FormData();
      
      // Add text fields
      Object.entries(homeData).forEach(([key, value]) => {
        if (key !== 'gallery' && key !== '_id') {
          formData.append(key, value.toString());
        }
      });

      // Add files
      Object.entries(files).forEach(([key, file]) => {
        if (Array.isArray(file)) {
          file.forEach(f => formData.append(key, f));
        } else {
          formData.append(key, file);
        }
      });

      const url = homeData._id 
        ? `${BASE_URL}/api/home/${homeData._id}`
        : `${BASE_URL}/api/home`;
      
      const method = homeData._id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formData
      });

      if (response.ok) {
        await fetchHomeData();
        setFiles({});
        alert(homeData._id ? 'Updated successfully!' : 'Created successfully!');
      }
    } catch (error) {
      console.error('Error saving home data:', error);
      alert('Error saving data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Home className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Hero Section</h3>
        </div>
        <div className="grid grid-cols-1 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={homeData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter main title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
            <textarea
              value={homeData.subtitle}
              onChange={(e) => handleInputChange('subtitle', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Enter subtitle"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={homeData.homebg}
                onChange={(e) => handleInputChange('homebg', e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Background image URL"
              />
              <button 
                type="button"
                onClick={() => createFileInput('homebg')}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all"
              >
                Browse
              </button>
            </div>
            {homeData.homebg && (
              <div className="mt-2">
                <img src={homeData.homebg} alt="Background preview" className="w-32 h-auto rounded border" />
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
            <input
              type="number"
              value={homeData.year_of_exp}
              onChange={(e) => handleInputChange('year_of_exp', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expert Team Members</label>
            <input
              type="number"
              value={homeData.expert_Team_members}
              onChange={(e) => handleInputChange('expert_Team_members', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Tours</label>
            <input
              type="number"
              value={homeData.total_tours}
              onChange={(e) => handleInputChange('total_tours', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Happy Travelers</label>
            <input
              type="number"
              value={homeData.happy_travelers}
              onChange={(e) => handleInputChange('happy_travelers', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Featured Images */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Image className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Featured Images</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destination Image</label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={homeData.destinationImage}
                onChange={(e) => handleInputChange('destinationImage', e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Image URL"
              />
              <button 
                type="button"
                onClick={() => createFileInput('destinationImage')}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all"
              >
                Browse
              </button>
            </div>
            {homeData.destinationImage && (
              <img src={homeData.destinationImage} alt="Destination preview" className="w-full h-auto rounded border" />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Personalized Image</label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={homeData.personalizedImage}
                onChange={(e) => handleInputChange('personalizedImage', e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Image URL"
              />
              <button 
                type="button"
                onClick={() => createFileInput('personalizedImage')}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all"
              >
                Browse
              </button>
            </div>
            {homeData.personalizedImage && (
              <img src={homeData.personalizedImage} alt="Personalized preview" className="w-full h-auto rounded border" />
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
            onClick={() => createFileInput('gallery', true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Images
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {homeData.gallery.map((image, index) => (
            <div key={index} className="relative">
              <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-32 object-cover rounded border" />
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : homeData._id ? 'Update' : 'Save'}
        </button>
      </div>
    </div>
  );
}