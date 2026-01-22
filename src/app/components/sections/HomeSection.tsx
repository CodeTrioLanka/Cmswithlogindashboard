import { Home, Image, BarChart3 } from 'lucide-react';
import type { HomePageData } from '@/app/App';

interface HomeSectionProps {
  data: HomePageData;
  onChange: (data: HomePageData) => void;
}

export function HomeSection({ data, onChange }: HomeSectionProps) {
  const handleChange = (field: keyof HomePageData, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  const handleGalleryChange = (index: number, value: string) => {
    const newGallery = [...data.gallery];
    newGallery[index] = value;
    onChange({ ...data, gallery: newGallery });
  };

  const addGalleryImage = () => {
    onChange({ ...data, gallery: [...data.gallery, ''] });
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = data.gallery.filter((_, i) => i !== index);
    onChange({ ...data, gallery: newGallery });
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
              value={data.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter main title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
            <textarea
              value={data.subtitle}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Enter subtitle"
            />
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
              value={data.year_of_exp}
              onChange={(e) => handleChange('year_of_exp', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expert Team Members</label>
            <input
              type="number"
              value={data.expert_Team_members}
              onChange={(e) => handleChange('expert_Team_members', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Tours</label>
            <input
              type="number"
              value={data.total_tours}
              onChange={(e) => handleChange('total_tours', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Happy Travelers</label>
            <input
              type="number"
              value={data.happy_travelers}
              onChange={(e) => handleChange('happy_travelers', parseInt(e.target.value) || 0)}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Home Background</label>
            <input
              type="url"
              value={data.homebg}
              onChange={(e) => handleChange('homebg', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Image URL"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destination Image</label>
            <input
              type="url"
              value={data.destinationImage}
              onChange={(e) => handleChange('destinationImage', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Image URL"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Personalized Image</label>
            <input
              type="url"
              value={data.personalizedImage}
              onChange={(e) => handleChange('personalizedImage', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Image URL"
            />
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
            onClick={addGalleryImage}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Image
          </button>
        </div>
        <div className="space-y-3">
          {data.gallery.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No gallery images yet</p>
              <p className="text-sm text-gray-500 mt-1">Click "Add Image" to get started</p>
            </div>
          ) : (
            data.gallery.map((url, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleGalleryChange(index, e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={`Gallery image ${index + 1} URL`}
                  />
                </div>
                <button
                  onClick={() => removeGalleryImage(index)}
                  className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Remove image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
