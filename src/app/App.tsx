import { useState, useEffect } from 'react';
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

export interface ExcursionData {
  title: string;
  description: string;
  location: string;
  price: string;
  image: string;
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
  excursions: ExcursionData[];
  thingsToDo: ThingsToDoData | null; // Changed to object or null
  services: ServiceData[];
  reviews: ReviewData[];
  contact: ContactData;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string; role: string } | null>(null);
  const [cmsData, setCmsData] = useState<CMSData>({
    home: {
      title: 'Discover Your Next Adventure',
      subtitle: 'Explore the world with our expert travel guides',
      year_of_exp: 15,
      expert_Team_members: 50,
      total_tours: 1200,
      happy_travelers: 25000,
      gallery: [],
      homebg: '',
      destinationImage: '',
      personalizedImage: ''
    },
    aboutUs: {
      title: 'About Our Company',
      description: 'We are a leading travel company with years of experience',
      mission: 'To provide unforgettable travel experiences',
      vision: 'To be the world\'s most trusted travel partner',
      image: ''
    },
    tours: [],
    excursions: [],
    thingsToDo: null, // Initial state
    services: [],
    reviews: [],
    contact: {
      email: 'info@example.com',
      phone: '+1 234 567 890',
      address: '123 Travel Street, City, Country',
      mapUrl: '',
      socialMedia: {
        facebook: '',
        instagram: '',
        twitter: ''
      }
    }
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = (userData: { id: string; email: string; role: string }) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
  };

  const handleUpdateData = (data: CMSData) => {
    setCmsData(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard
          cmsData={cmsData}
          onUpdate={handleUpdateData}
          onLogout={handleLogout}
          user={user || undefined}
        />
      )}
    </div>
  );
}