import { useState, useEffect } from 'react';
import { Info, TrendingUp, Calendar, Heart, Users, Plus, Trash2, Save, Loader2, AlertCircle } from 'lucide-react';
import {
  fetchAboutUsData,
  createAboutUsData,
  updateAboutUsData,
  AboutUsData,
  AboutUsStats,
  Milestone,
  Value,
  TeamMember
} from '../../../services/aboutUsApi';

export function AboutUsSection() {
  const [aboutUsData, setAboutUsData] = useState<AboutUsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [stats, setStats] = useState<AboutUsStats>({
    yearExperience: 0,
    happyTravelers: 0,
    toursCompleted: 0,
    destination: 0
  });
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [values, setValues] = useState<Value[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [teamImages, setTeamImages] = useState<{ [key: number]: File | null }>({});

  useEffect(() => {
    loadAboutUsData();
  }, []);

  const loadAboutUsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAboutUsData();
      if (data) {
        setAboutUsData(data);
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

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();

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
        if (member.image && !teamImages[index]) {
          formData.append(`team[${index}][image]`, member.image);
        }
      });

      // Add team images
      Object.entries(teamImages).forEach(([index, file]) => {
        if (file) {
          formData.append(`team[${index}][image]`, file);
        }
      });

      let result;
      if (aboutUsData?._id) {
        result = await updateAboutUsData(aboutUsData._id, formData);
      } else {
        result = await createAboutUsData(formData);
      }

      setAboutUsData(result);
      setSuccess('About Us data saved successfully!');
      setTeamImages({});

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save about us data');
      console.error(err);
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
    setValues([...values, { icon: '', title: '', description: '', color: '#3B82F6' }]);
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

  const handleTeamImageChange = (index: number, file: File | null) => {
    setTeamImages({ ...teamImages, [index]: file });
  };

  const removeTeamMember = (index: number) => {
    setTeam(team.filter((_, i) => i !== index));
    const newImages = { ...teamImages };
    delete newImages[index];
    setTeamImages(newImages);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">About Us Content</h3>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <Info className="w-5 h-5" />
          {success}
        </div>
      )}

      <div className="space-y-8">
        {/* Stats Section */}
        <div className="border-b pb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h4 className="text-md font-semibold text-gray-900">Statistics</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
              <input
                type="number"
                value={stats.yearExperience}
                onChange={(e) => setStats({ ...stats, yearExperience: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Happy Travelers</label>
              <input
                type="number"
                value={stats.happyTravelers}
                onChange={(e) => setStats({ ...stats, happyTravelers: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="5000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tours Completed</label>
              <input
                type="number"
                value={stats.toursCompleted}
                onChange={(e) => setStats({ ...stats, toursCompleted: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destinations</label>
              <input
                type="number"
                value={stats.destination}
                onChange={(e) => setStats({ ...stats, destination: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="50"
              />
            </div>
          </div>
        </div>

        {/* Milestones Section */}
        <div className="border-b pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h4 className="text-md font-semibold text-gray-900">Milestones</h4>
            </div>
            <button
              onClick={addMilestone}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Milestone
            </button>
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
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="2020"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event</label>
                      <input
                        type="text"
                        value={milestone.event}
                        onChange={(e) => updateMilestone(index, 'event', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Company Founded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <input
                        type="text"
                        value={milestone.mstone_description}
                        onChange={(e) => updateMilestone(index, 'mstone_description', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Started our journey..."
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeMilestone(index)}
                    className="mt-8 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
              <Heart className="w-5 h-5 text-blue-600" />
              <h4 className="text-md font-semibold text-gray-900">Our Values</h4>
            </div>
            <button
              onClick={addValue}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Value
            </button>
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
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Heart"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={value.title}
                        onChange={(e) => updateValue(index, 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Customer First"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={value.description}
                        onChange={(e) => updateValue(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
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
                          className="h-11 w-16 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={value.color}
                          onChange={(e) => updateValue(index, 'color', e.target.value)}
                          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="#3B82F6"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeValue(index)}
                    className="mt-8 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
              <Users className="w-5 h-5 text-blue-600" />
              <h4 className="text-md font-semibold text-gray-900">Team Members</h4>
            </div>
            <button
              onClick={addTeamMember}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Team Member
            </button>
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
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <input
                          type="text"
                          value={member.role}
                          onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        placeholder="Brief bio about the team member..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleTeamImageChange(index, e.target.files?.[0] || null)}
                          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        {(member.image || teamImages[index]) && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-300">
                            <img
                              src={teamImages[index] ? URL.createObjectURL(teamImages[index]!) : member.image}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeTeamMember(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
