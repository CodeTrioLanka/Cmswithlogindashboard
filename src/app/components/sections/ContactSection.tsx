import { Mail, Phone, MapPin, Globe, Save, Edit, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const BASE_URL = import.meta.env.VITE_BASE_URL || "https://nature-escape-web-back.vercel.app";

interface ContactData {
  _id?: string;
  email: string;
  phone: string;
  address: string;
  googleMap: string;
  socials: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
}

export function ContactSection() {
  const [contactData, setContactData] = useState<ContactData>({
    email: '',
    phone: '',
    address: '',
    googleMap: '',
    socials: {
      facebook: '',
      instagram: '',
      twitter: ''
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/contactus`);
        if (response.ok) {
          const data = await response.json();
          // Ensure we have the structure even if some fields are missing from backend
          setContactData({
            ...data,
            socials: {
              facebook: data.socials?.facebook || '',
              instagram: data.socials?.instagram || '',
              twitter: data.socials?.twitter || '',
            }
          });
        }
      } catch (error) {
        console.error("Failed to fetch contact data:", error);
        toast.error("Failed to load contact information");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchContactData();
  }, []);

  const handleInputChange = (field: keyof ContactData, value: string) => {
    setContactData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (platform: keyof ContactData['socials'], value: string) => {
    setContactData(prev => ({
      ...prev,
      socials: { ...prev.socials, [platform]: value }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/contactus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setContactData(updatedData);
        setIsEditing(false);
        toast.success("Contact information saved successfully");
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error("Error saving contact data:", error);
      toast.error("Failed to save contact information");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <div className="p-6 text-center">Loading contact information...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Contact Settings</h2>
        <div className="flex gap-2">
          {isEditing && (
            <button
              onClick={() => setIsEditing(false)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md font-medium"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
          <button
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md font-medium"
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            {loading ? "Saving..." : isEditing ? "Save" : "Edit"}
          </button>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Mail className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                Email Address
              </div>
            </label>
            <input
              type="email"
              value={contactData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              readOnly={!isEditing}
              className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="info@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                Phone Number
              </div>
            </label>
            <input
              type="tel"
              value={contactData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              readOnly={!isEditing}
              className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="+1 234 567 890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                Address
              </div>
            </label>
            <textarea
              value={contactData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              readOnly={!isEditing}
              rows={3}
              className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="123 Street Name, City, Country"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                Google Maps Embed URL
              </div>
            </label>
            <input
              type="url"
              value={contactData.googleMap}
              onChange={(e) => handleInputChange('googleMap', e.target.value)}
              readOnly={!isEditing}
              className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="https://maps.google.com/..."
            />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Globe className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Social Media Links</h3>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Facebook URL</label>
            <input
              type="url"
              value={contactData.socials.facebook}
              onChange={(e) => handleSocialChange('facebook', e.target.value)}
              readOnly={!isEditing}
              className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="https://facebook.com/yourpage"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
            <input
              type="url"
              value={contactData.socials.instagram}
              onChange={(e) => handleSocialChange('instagram', e.target.value)}
              readOnly={!isEditing}
              className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="https://instagram.com/yourprofile"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Twitter URL</label>
            <input
              type="url"
              value={contactData.socials.twitter}
              onChange={(e) => handleSocialChange('twitter', e.target.value)}
              readOnly={!isEditing}
              className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="https://twitter.com/yourhandle"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
