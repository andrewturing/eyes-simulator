'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/utils/useAuth';
import Navbar from '@/components/layout/Navbar';

// Define user data interface
interface UserData {
  _id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProfilePage() {
  const { user, loading } = useAuth(true); // Auto-redirect if not logged in
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    // Fetch user data from API
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <main>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-2xl font-semibold text-indigo-600">Loading profile...</div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8 bg-indigo-600 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-indigo-700 rounded-full flex items-center justify-center text-4xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="ml-6">
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-indigo-200 mt-1">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h2>
            
            {userData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-md p-4">
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="text-lg font-medium">{userData.name}</p>
                  </div>
                  <div className="border border-gray-200 rounded-md p-4">
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="text-lg font-medium">{userData.email}</p>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-md p-4">
                  <p className="text-sm text-gray-500">Account Created</p>
                  <p className="text-lg font-medium">
                    {userData.createdAt 
                      ? new Date(userData.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Loading user data...</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 