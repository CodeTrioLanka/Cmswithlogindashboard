import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';

export interface HomePageData {
  title: string;
  subtitle: string;
  year_of_exp: number;
  expert_Team_members: number;
  total_tours: number;
  happy_travelers: number;
  gallery: string[];
  homebg: string;
  destinationImage: string;
  personalizedImage: string;
}

export interface AboutUsData {
  title: string;
  description: string;
  mission: string;
  vision: string;
  image: string;
}

export interface TourData {
  title: string;
  description: string;
  duration: string;
  price: string;
  image: string;
}

export interface ExcursionItem {
  _id?: string;
  title: string;
  image: string;
  description: string;
  category: string;
  time: string;
  destination: string;
  slug?: string;
}

export interface ExcursionHero {
  _id?: string;
  heroImage: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface ExcursionData {
  _id?: string;
  excursionHeroes: ExcursionHero[];
  excursion: ExcursionItem[];
}

export interface ThingsToDoItem {
  _id?: string;
  title: string;
  description: string;
  image: string;
}

export interface ThingsToDoHero {
  _id?: string;
  heroImage: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface ThingsToDoData {
  _id?: string;
  thingsToDoHeroes: ThingsToDoHero[];
  thingsToDo: ThingsToDoItem[];
}

export interface ServiceData {
  _id?: string;
  title: string;
  description: string;
  image: string;
}

export interface ReviewData {
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ContactData {
  email: string;
  phone: string;
  address: string;
  mapUrl: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
}

export interface CMSData {
  home: HomePageData;
  aboutUs: AboutUsData;
  tours: TourData[];
  excursions: ExcursionData | null;
  thingsToDo: ThingsToDoData | null; // Changed to object or null
  services: ServiceData[];
  reviews: ReviewData[];
  contact: ContactData;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string; role: string } | null>(null);



  useEffect(() => {
    const validateSession = async () => {
      setIsValidating(true);
      try {
        const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://nature-escape-web-back.vercel.app';
        const response = await fetch(`${BASE_URL}/api/auth/me`, {
          method: 'GET',
          credentials: 'include', // Important: sends cookies
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user && data.user.id) {
            // Valid session with JWT token
            const userData = {
              id: data.user.id,
              email: data.user.email || '',
              role: data.user.role || 'user'
            };
            setUser(userData);
            setIsLoggedIn(true);
            // Update localStorage for consistency
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            // Invalid session
            localStorage.removeItem('user');
            setIsLoggedIn(false);
            setUser(null);
          }
        } else {
          // No valid session
          localStorage.removeItem('user');
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Session validation error:', error);
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setIsValidating(false);
      }
    };

    validateSession();
  }, []);

  const handleLogin = (userData: { id: string; email: string; role: string }) => {
    setUser(userData);
    setIsLoggedIn(true);
  };


  const handleLogout = async () => {
    try {
      const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://nature-escape-web-back.vercel.app';
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state even if API call fails
      localStorage.removeItem('user');
      setUser(null);
      setIsLoggedIn(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-right" richColors />
      {isValidating ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Validating session...</p>
          </div>
        </div>
      ) : !isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard
          onLogout={handleLogout}
          user={user || undefined}
        />
      )}
    </div>
  );
}