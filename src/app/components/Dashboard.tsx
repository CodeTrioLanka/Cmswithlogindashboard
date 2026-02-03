import { useState } from 'react';
import { LogOut, Home, Info, Compass, Activity, Briefcase, Star, Mail, ChevronRight, FolderTree, Package, Lock, FileText } from 'lucide-react';

import { HomeSection } from './sections/HomeSection';
import { AboutUsSection } from './sections/AboutUsSection';
import { TourCategoriesSection } from './sections/TourCategoriesSection';
import { PackagesSection } from './sections/PackagesSection';
import { ExcursionsSection } from './sections/ExcursionsSection';
import { ThingsToDoSection } from './sections/ThingsToDoSection';
import { ServicesSection } from './sections/ServicesSection';
import { ReviewsSection } from './sections/ReviewsSection';
import { ContactSection } from './sections/ContactSection';
import { ChangePasswordSection } from './sections/ChangePasswordSection';
import { UserLogsSection } from './sections/UserLogsSection';
import { ThemeToggle } from './ui/ThemeToggle';
import natureEscapeLogo from '../../assets/nature-escape-logo.png';

interface DashboardProps {
  onLogout: () => void;
  user?: { id: string; email: string; role: string };
}

type Section = 'home' | 'about' | 'tourCategories' | 'packages' | 'excursions' | 'things' | 'services' | 'reviews' | 'contact' | 'userLogs' | 'changePassword';

export function Dashboard({ onLogout, user }: DashboardProps) {
  // Get initial section from localStorage or default to 'home'
  const [activeSection, setActiveSection] = useState<Section>(() => {
    const saved = localStorage.getItem('activeSection');
    return (saved as Section) || 'home';
  });

  // Save active section to localStorage whenever it changes
  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
    localStorage.setItem('activeSection', section);
  };

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
    { id: 'userLogs' as Section, label: 'User Logs', icon: FileText },
    { id: 'changePassword' as Section, label: 'Change Password', icon: Lock },
  ];



  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <HomeSection />;
      case 'about':
        return <AboutUsSection />;
      case 'tourCategories':
        return <TourCategoriesSection />;
      case 'packages':
        return <PackagesSection />;
      case 'excursions':
        return <ExcursionsSection />;
      case 'things':
        return <ThingsToDoSection data={null} onChange={() => { }} />;
      case 'services':
        return <ServicesSection />;
      case 'reviews':
        return <ReviewsSection />;
      case 'contact':
        return <ContactSection />;
      case 'userLogs':
        return <UserLogsSection />;
      case 'changePassword':
        return <ChangePasswordSection onLogout={onLogout} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 transition-colors duration-200">
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <img src={natureEscapeLogo} alt="Nature Escape Logo" className="w-16 h-16 object-contain" />
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Nature Escape</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Admin Dashboard</p>
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
                    onClick={() => handleSectionChange(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all ${isActive
                      ? 'bg-gradient-to-r from-green-700 to-emerald-600 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {user && (
              <div className="mb-3 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Logged in as</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.email}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
              </div>
            )}
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
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
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm transition-colors duration-200">
          <div className="px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {menuItems.find(item => item.id === activeSection)?.label}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Manage your {menuItems.find(item => item.id === activeSection)?.label.toLowerCase()} content
                </p>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>



        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
