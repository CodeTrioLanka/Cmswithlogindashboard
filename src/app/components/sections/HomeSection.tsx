import { Home, Image, BarChart3 } from 'lucide-react';
import { useRef, useState } from 'react';

export function HomeSection() {
  const [images, setImages] = useState({
    background: 'https://example.com/home-bg.jpg',
    homebg: 'https://example.com/home-bg.jpg',
    destinationImage: 'https://example.com/destination.jpg',
    personalizedImage: 'https://example.com/personalized.jpg',
    gallery: ['https://example.com/gallery1.jpg', 'https://example.com/gallery2.jpg']
  });

  const createFileInput = (onFileSelect: (url: string) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        onFileSelect(url);
      }
    };
    input.click();
  };

  const addGalleryImage = () => {
    setImages(prev => ({ ...prev, gallery: [...prev.gallery, ''] }));
  };

  const removeGalleryImage = (index: number) => {
    setImages(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }));
  };

  const handleImageUpdate = (key: string, value: string) => {
    setImages(prev => ({ ...prev, [key]: value }));
  };
  const sampleData = {
    title: 'Welcome to Sri Lanka Tours',
    subtitle: 'Discover the beauty of Sri Lanka with our amazing tour packages',
    year_of_exp: 10,
    expert_Team_members: 25,
    total_tours: 150,
    happy_travelers: 5000,
    homebg: 'https://example.com/home-bg.jpg',
    destinationImage: 'https://example.com/destination.jpg',
    personalizedImage: 'https://example.com/personalized.jpg',
    gallery: ['https://example.com/gallery1.jpg', 'https://example.com/gallery2.jpg']
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
              defaultValue={sampleData.title}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter main title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
            <textarea
              defaultValue={sampleData.subtitle}
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
                value={images.background}
                onChange={(e) => handleImageUpdate('background', e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Background image URL"
              />
              <button 
                type="button"
                onClick={() => createFileInput((url) => handleImageUpdate('background', url))}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all"
              >
                Browse
              </button>
            </div>
            {images.background && (
              <div className="mt-2">
                <img src={images.background} alt="Background preview" className="w-32 h-auto rounded border" />
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
              defaultValue={sampleData.year_of_exp}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expert Team Members</label>
            <input
              type="number"
              defaultValue={sampleData.expert_Team_members}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Tours</label>
            <input
              type="number"
              defaultValue={sampleData.total_tours}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Happy Travelers</label>
            <input
              type="number"
              defaultValue={sampleData.happy_travelers}
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
                value={images.destinationImage}
                onChange={(e) => handleImageUpdate('destinationImage', e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Image URL"
              />
              <button 
                type="button"
                onClick={() => createFileInput((url) => handleImageUpdate('destinationImage', url))}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all"
              >
                Browse
              </button>
            </div>
            {images.destinationImage && (
              <img src={images.destinationImage} alt="Destination preview" className="w-full h-auto rounded border" />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Personalized Image</label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={images.personalizedImage}
                onChange={(e) => handleImageUpdate('personalizedImage', e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Image URL"
              />
              <button 
                type="button"
                onClick={() => createFileInput((url) => handleImageUpdate('personalizedImage', url))}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all"
              >
                Browse
              </button>
            </div>
            {images.personalizedImage && (
              <img src={images.personalizedImage} alt="Personalized preview" className="w-full h-auto rounded border" />
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
            onClick={addGalleryImage}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Image
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.gallery.map((url, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    const newGallery = [...images.gallery];
                    newGallery[index] = e.target.value;
                    setImages(prev => ({ ...prev, gallery: newGallery }));
                  }}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Image ${index + 1} URL`}
                />
                <button 
                  type="button"
                  onClick={() => createFileInput((newUrl) => {
                    const newGallery = [...images.gallery];
                    newGallery[index] = newUrl;
                    setImages(prev => ({ ...prev, gallery: newGallery }));
                  })}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200 transition-all"
                >
                  Browse
                </button>
              </div>
              {url && (
                <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-auto rounded" />
              )}
              <button 
                onClick={() => removeGalleryImage(index)}
                className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-all"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
