import { useState, useEffect } from 'react';
import { Info, TrendingUp, Calendar, Heart, Users, Plus, Trash2, Save, Loader2, Image, Edit, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchAboutUsData,
  AboutUsData,
  AboutUsStats,
  Milestone,
  Value,
  TeamMember
} from '../../../services/aboutUsApi';
import { ImageUploadInput } from '../ui/ImageUploadInput';
import { deleteFromCloudinary } from '../../../services/deleteApi';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://nature-escape-web-back.vercel.app';

export function AboutUsSection() {
  const [aboutUsData, setAboutUsData] = useState<AboutUsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState<AboutUsData | null>(null);

  // Form state
  const [hero, setHero] = useState({
    heroBackground: '',
    heroTitle: '',
    heroDescription: ''
  });
  const [stats, setStats] = useState<AboutUsStats>({
    yearExperience: 0,
    happyTravelers: 0,
    toursCompleted: 0,
    destination: 0
  });
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [values, setValues] = useState<Value[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    loadAboutUsData();
  }, []);

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
    const oldUrl = hero.heroBackground;
    if (oldUrl && oldUrl !== url) handleDeleteImage(oldUrl);
    setHero(prev => ({ ...prev, heroBackground: url }));
  };

  const handleTeamImageUpdate = (index: number, url: string) => {
    const updated = [...team];
    const oldUrl = updated[index].image;
    if (oldUrl && oldUrl !== url) handleDeleteImage(oldUrl);
    updated[index] = { ...updated[index], image: url };
    setTeam(updated);
  };

  const loadAboutUsData = async () => {
    try {
      setLoading(true);
      const data = await fetchAboutUsData();
      if (data) {
        setAboutUsData(data);
        setOriginalData(data);
        setHero(data.hero || { heroBackground: '', heroTitle: '', heroDescription: '' });
        setStats(data.stats);
        setMilestones(data.milestones || []);
        setValues(data.values || []);
        setTeam(data.team || []);
      }
      // If data is null, that's okay - user can create new data
    } catch (err) {
      // Only show error for actual network/server errors
      console.error('Error loading about us data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (originalData) {
      setAboutUsData(originalData);
      setHero(originalData.hero || { heroBackground: '', heroTitle: '', heroDescription: '' });
      setStats(originalData.stats);
      setMilestones(originalData.milestones || []);
      setValues(originalData.values || []);
      setTeam(originalData.team || []);
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const formData = new FormData();

      // Add hero data
      formData.append('hero[heroTitle]', hero.heroTitle);
      formData.append('hero[heroDescription]', hero.heroDescription);
      if (hero.heroBackground) {
        formData.append('hero[heroBackground]', hero.heroBackground);
      }

      // Add stats
      formData.append('stats[yearExperience]', stats.yearExperience.toString());
      formData.append('stats[happyTravelers]', stats.happyTravelers.toString());
      formData.append('stats[toursCompleted]', stats.toursCompleted.toString());
      formData.append('stats[destination]', stats.destination.toString());

      // Add milestones
      milestones.forEach((milestone, index) => {
        formData.append(`milestones[${index}][year]`, milestone.year.toString());
        formData.append(`milestones[${index}][event]`, milestone.event);
        formData.append(`milestones[${index}][mstone_description]`, milestone.mstone_description);
      });

      // Add values
      values.forEach((value, index) => {
        formData.append(`values[${index}][icon]`, value.icon);
        formData.append(`values[${index}][title]`, value.title);
        formData.append(`values[${index}][description]`, value.description);
        formData.append(`values[${index}][color]`, value.color);
      });

      // Add team members
      team.forEach((member, index) => {
        formData.append(`team[${index}][name]`, member.name);
        formData.append(`team[${index}][role]`, member.role);
        formData.append(`team[${index}][bio]`, member.bio);
        if (member.image) {
          formData.append(`team[${index}][image]`, member.image);
        }
      });

      let response;
      let result;

      if (aboutUsData?._id) {
        // Update existing data
        response = await fetch(`${BASE_URL}/api/aboutus/${aboutUsData._id}`, {
          method: 'PUT',
          body: formData
        });
      } else {
        // Create new data
        response = await fetch(`${BASE_URL}/api/aboutus/setData`, {
          method: 'POST',
          body: formData
        });
      }

      result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save about us data');
      }

      const newData = result.data;
      setAboutUsData(newData);
      setOriginalData(newData);

      setIsEditing(false);
      toast.success(result.message || (aboutUsData?._id ? 'Updated successfully!' : 'Created successfully!'));

    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Failed to save data');
    } finally {
      setSaving(false);
    }
  };

  // Milestone handlers
  const addMilestone = () => {
    setMilestones([...milestones, { year: new Date().getFullYear(), event: '', mstone_description: '' }]);
  };

  const updateMilestone = (index: number, field: keyof Milestone, value: string | number) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  // Value handlers
  const addValue = () => {
    setValues([...values, { icon: '', title: '', description: '', color: '#16a34a' }]);
  };

  const updateValue = (index: number, field: keyof Value, value: string) => {
    const updated = [...values];
    updated[index] = { ...updated[index], [field]: value };
    setValues(updated);
  };

  const removeValue = (index: number) => {
    setValues(values.filter((_, i) => i !== index));
  };

  // Team handlers
  const addTeamMember = () => {
    setTeam([...team, { name: '', role: '', image: '', bio: '' }]);
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...team];
    updated[index] = { ...updated[index], [field]: value };
    setTeam(updated);
  };

  const removeTeamMember = (index: number) => {
    setTeam(team.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">About Us Content</h3>
        </div>
        <div className="flex gap-2">
          {isEditing && (
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-all"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
          <button
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                Edit
              </>
            )}
          </button>
        </div>
      </div>



      <div className="space-y-8">
        {/* Hero Section */}
        <div className="border-b pb-6">
          <div className="flex items-center gap-2 mb-4">
            <Image className="w-5 h-5 text-green-600" />
            <h4 className="text-md font-semibold text-gray-900">Hero Section</h4>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
              <input
                type="text"
                value={hero.heroTitle}
                onChange={(e) => setHero({ ...hero, heroTitle: e.target.value })}
                readOnly={!isEditing}
                className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="We Create Unforgettable Journeys"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero Description</label>
              <textarea
                value={hero.heroDescription}
                onChange={(e) => setHero({ ...hero, heroDescription: e.target.value })}
                rows={3}
                readOnly={!isEditing}
                className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="Discover the world with us and create memories that last a lifetime..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero Background Image</label>
              <div className="space-y-2">
                <ImageUploadInput
                  value={hero.heroBackground}
                  onChange={handleHeroImageUpdate}
                  disabled={!isEditing}
                  placeholder="Hero Background URL"
                />
                {hero.heroBackground && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300">
                    <img
                      src={hero.heroBackground}
                      alt="Hero background preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="border-b pb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h4 className="text-md font-semibold text-gray-900">Statistics</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
              <input
                type="number"
                value={stats.yearExperience}
                onChange={(e) => setStats({ ...stats, yearExperience: parseInt(e.target.value) || 0 })}
                readOnly={!isEditing}
                className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Happy Travelers</label>
              <input
                type="number"
                value={stats.happyTravelers}
                onChange={(e) => setStats({ ...stats, happyTravelers: parseInt(e.target.value) || 0 })}
                readOnly={!isEditing}
                className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="5000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tours Completed</label>
              <input
                type="number"
                value={stats.toursCompleted}
                onChange={(e) => setStats({ ...stats, toursCompleted: parseInt(e.target.value) || 0 })}
                readOnly={!isEditing}
                className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destinations</label>
              <input
                type="number"
                value={stats.destination}
                onChange={(e) => setStats({ ...stats, destination: parseInt(e.target.value) || 0 })}
                readOnly={!isEditing}
                className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="50"
              />
            </div>
          </div>
        </div>

        {/* Milestones Section */}
        <div className="border-b pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <h4 className="text-md font-semibold text-gray-900">Milestones</h4>
            </div>
            {isEditing && (
              <button
                onClick={addMilestone}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Milestone
              </button>
            )}
          </div>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                      <input
                        type="number"
                        value={milestone.year}
                        onChange={(e) => updateMilestone(index, 'year', parseInt(e.target.value) || 0)}
                        readOnly={!isEditing}
                        className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        placeholder="2020"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event</label>
                      <input
                        type="text"
                        value={milestone.event}
                        onChange={(e) => updateMilestone(index, 'event', e.target.value)}
                        readOnly={!isEditing}
                        className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        placeholder="Company Founded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <input
                        type="text"
                        value={milestone.mstone_description}
                        onChange={(e) => updateMilestone(index, 'mstone_description', e.target.value)}
                        readOnly={!isEditing}
                        className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        placeholder="Started our journey..."
                      />
                    </div>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => removeMilestone(index)}
                      className="mt-8 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {milestones.length === 0 && (
              <p className="text-center text-gray-500 py-4">No milestones added yet. Click "Add Milestone" to get started.</p>
            )}
          </div>
        </div>

        {/* Values Section */}
        <div className="border-b pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-green-600" />
              <h4 className="text-md font-semibold text-gray-900">Our Values</h4>
            </div>
            {isEditing && (
              <button
                onClick={addValue}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Value
              </button>
            )}
          </div>
          <div className="space-y-4">
            {values.map((value, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Icon (Lucide icon name)</label>
                      <input
                        type="text"
                        value={value.icon}
                        onChange={(e) => updateValue(index, 'icon', e.target.value)}
                        readOnly={!isEditing}
                        className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        placeholder="Heart"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={value.title}
                        onChange={(e) => updateValue(index, 'title', e.target.value)}
                        readOnly={!isEditing}
                        className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        placeholder="Customer First"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={value.description}
                        onChange={(e) => updateValue(index, 'description', e.target.value)}
                        rows={2}
                        readOnly={!isEditing}
                        className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        placeholder="We prioritize our customers..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Color (Hex)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={value.color}
                          onChange={(e) => updateValue(index, 'color', e.target.value)}
                          disabled={!isEditing}
                          className={`h-11 w-16 border border-gray-300 rounded-lg ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed bg-gray-50'}`}
                        />
                        <input
                          type="text"
                          value={value.color}
                          onChange={(e) => updateValue(index, 'color', e.target.value)}
                          readOnly={!isEditing}
                          className={`flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                          placeholder="#16a34a"
                        />
                      </div>
                    </div>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => removeValue(index)}
                      className="mt-8 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {values.length === 0 && (
              <p className="text-center text-gray-500 py-4">No values added yet. Click "Add Value" to get started.</p>
            )}
          </div>
        </div>

        {/* Team Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              <h4 className="text-md font-semibold text-gray-900">Team Members</h4>
            </div>
            {isEditing && (
              <button
                onClick={addTeamMember}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Team Member
              </button>
            )}
          </div>
          <div className="space-y-4">
            {team.map((member, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                          readOnly={!isEditing}
                          className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <input
                          type="text"
                          value={member.role}
                          onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                          readOnly={!isEditing}
                          className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                          placeholder="CEO & Founder"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        value={member.bio}
                        onChange={(e) => updateTeamMember(index, 'bio', e.target.value)}
                        rows={2}
                        readOnly={!isEditing}
                        className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        placeholder="Brief bio about the team member..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                      <div className="flex items-center gap-4">
                        <ImageUploadInput
                          value={member.image}
                          onChange={(url) => handleTeamImageUpdate(index, url)}
                          disabled={!isEditing}
                          placeholder="Team Member Image URL"
                        />
                        {member.image && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-300">
                            <img
                              src={member.image}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => removeTeamMember(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {team.length === 0 && (
              <p className="text-center text-gray-500 py-4">No team members added yet. Click "Add Team Member" to get started.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
