import { useState } from 'react';
import { LogOut, Save, Home, Info, MapPin, Compass, Activity, Briefcase, Star, Mail, ChevronRight, FolderTree, Package } from 'lucide-react';
import type { CMSData } from '../App';
import { HomeSection } from './sections/HomeSection';
import { AboutUsSection } from './sections/AboutUsSection';
import { TourCategoriesSection } from './sections/TourCategoriesSection';
import { PackagesSection } from './sections/PackagesSection';
import { ExcursionsSection } from './sections/ExcursionsSection';
import { ThingsToDoSection } from './sections/ThingsToDoSection';
import { ServicesSection } from './sections/ServicesSection';
import { ReviewsSection } from './sections/ReviewsSection';
import { ContactSection } from './sections/ContactSection';

interface DashboardProps {
  cmsData: CMSData;
  onUpdate: (data: CMSData) => void;
  onLogout: () => void;
  user?: { id: string; email: string; role: string };
}

type Section = 'home' | 'about' | 'tourCategories' | 'packages' | 'excursions' | 'things' | 'services' | 'reviews' | 'contact';

export function Dashboard({ cmsData, onUpdate, onLogout, user }: DashboardProps) {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [formData, setFormData] = useState<CMSData>(cmsData);
  const [isSaved, setIsSaved] = useState(false);

  const menuItems = [
    { id: 'home' as Section, label: 'Home', icon: Home },
    { id: 'about' as Section, label: 'About Us', icon: Info },
    { id: 'tourCategories' as Section, label: 'Sri Lanka Tours', icon: FolderTree },
    { id: 'packages' as Section, label: 'Tour Packages', icon: Package },
    { id: 'excursions' as Section, label: 'Excursions', icon: Compass },
    { id: 'things' as Section, label: 'Things To Do', icon: Activity },
    { id: 'services' as Section, label: 'Services', icon: Briefcase },
    { id: 'reviews' as Section, label: 'Reviews', icon: Star },
    { id: 'contact' as Section, label: 'Contact', icon: Mail },
  ];

  const handleSave = () => {
    onUpdate(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <HomeSection data={formData.home} onChange={(data) => setFormData({ ...formData, home: data })} />;
      case 'about':
        return <AboutUsSection data={formData.aboutUs} onChange={(data) => setFormData({ ...formData, aboutUs: data })} />;
      case 'tourCategories':
        return <TourCategoriesSection />;
      case 'packages':
        return <PackagesSection />;
      case 'excursions':
        return <ExcursionsSection data={formData.excursions} onChange={(data) => setFormData({ ...formData, excursions: data })} />;
      case 'things':
        return <ThingsToDoSection data={formData.thingsToDo} onChange={(data) => setFormData({ ...formData, thingsToDo: data })} />;
      case 'services':
        return <ServicesSection data={formData.services} onChange={(data) => setFormData({ ...formData, services: data })} />;
      case 'reviews':
        return <ReviewsSection data={formData.reviews} onChange={(data) => setFormData({ ...formData, reviews: data })} />;
      case 'contact':
        return <ContactSection data={formData.contact} onChange={(data) => setFormData({ ...formData, contact: data })} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">CMS</h1>
                <p className="text-xs text-gray-600">Content Manager</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all ${isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            {user && (
              <div className="mb-3 px-4 py-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Logged in as</p>
                <p className="text-sm font-medium text-gray-700">{user.email}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            )}
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {menuItems.find(item => item.id === activeSection)?.label}
                </h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  Manage your {menuItems.find(item => item.id === activeSection)?.label.toLowerCase()} content
                </p>
              </div>
              {/* <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button> */}
            </div>
          </div>
        </header>

        {/* Success Message */}
        {isSaved && (
          <div className="px-8 pt-4">
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Changes saved successfully!</span>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
