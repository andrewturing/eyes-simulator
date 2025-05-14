'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
}

export function useAuth(redirectToLogin = true) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        
        // Check to see if we have auth cookies first
        const checkResponse = await fetch('/api/auth/check');
        const checkData = await checkResponse.json();
        
        console.log('Auth check response:', checkData);
        
        if (!checkData.authenticated) {
          console.warn('No authentication token found');
          setUser(null);
          if (redirectToLogin) {
            const currentPath = window.location.pathname;
            router.push(`/login?callbackUrl=${currentPath}`);
          }
          return;
        }
        
        // Get actual user data if we have a token
        const userResponse = await fetch('/api/auth/me');
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          console.log('User authenticated:', userData.email);
        } else {
          setUser(null);
          console.warn('Failed to get user data:', userResponse.status);
          
          if (redirectToLogin) {
            const currentPath = window.location.pathname;
            router.push(`/login?callbackUrl=${currentPath}`);
          }
        }
      } catch (err) {
        console.error('Auth error:', err);
        setError(err instanceof Error ? err.message : 'Authentication error');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router, redirectToLogin]);

  const logout = async () => {
    try {
      setLoading(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout error');
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, logout };
} 