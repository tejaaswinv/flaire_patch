import React, { useEffect, useState } from 'react';
import { Auth } from './components/auth';
import { Dashboard } from './components/dashboard';
import { api } from '../lib/api';

interface User {
  email: string;
  name: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const me = await api.me();
        setUser({
          email: me.email,
          name: me.name,
        });
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse"
            style={{ backgroundColor: '#7293BB' }}
          >
            <span className="text-2xl text-white">🌸</span>
          </div>
          <h1 className="text-2xl font-semibold" style={{ color: '#7293BB' }}>
            Flaire
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return <Dashboard userName={user.name} onLogout={handleLogout} />;
}