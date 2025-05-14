'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AuthStatus {
  authenticated: boolean;
  tokenExists: boolean;
  tokenInfo?: string;
  userData?: {
    name: string;
    email: string;
  };
  error?: string;
}

export default function AuthTestPage() {
  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        // Check for token
        const tokenCheck = await fetch('/api/auth/check');
        const tokenData = await tokenCheck.json();
        
        // Initialize status
        const authStatus: AuthStatus = {
          authenticated: tokenData.authenticated || false,
          tokenExists: tokenData.tokenExists || false,
          tokenInfo: tokenData.tokenPrefix
        };
        
        // If token exists, try to get user data
        if (authStatus.tokenExists) {
          try {
            const userResponse = await fetch('/api/auth/me');
            if (userResponse.ok) {
              const userData = await userResponse.json();
              authStatus.userData = {
                name: userData.name,
                email: userData.email
              };
              authStatus.authenticated = true;
            } else {
              authStatus.error = `User data fetch failed: ${userResponse.status}`;
              authStatus.authenticated = false;
            }
          } catch (error) {
            authStatus.error = `User data error: ${error instanceof Error ? error.message : String(error)}`;
          }
        }
        
        setStatus(authStatus);
      } catch (error) {
        console.error('Auth test error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleGoToSimulator = () => {
    window.location.href = '/simulator';
  };

  const handleLogin = () => {
    window.location.href = '/login?callbackUrl=/auth-test';
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="mb-6 text-3xl font-bold">Authentication Test Page</h1>
      
      {loading ? (
        <div className="text-xl">Checking authentication...</div>
      ) : (
        <div className="w-full max-w-md">
          <div className="p-4 mb-6 border rounded-lg shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">Authentication Status</h2>
            <p className="mb-2">
              <span className="font-medium">Authenticated:</span>{' '}
              <span className={status?.authenticated ? 'text-green-600' : 'text-red-600'}>
                {status?.authenticated ? 'Yes' : 'No'}
              </span>
            </p>
            <p className="mb-2">
              <span className="font-medium">Token Exists:</span>{' '}
              <span className={status?.tokenExists ? 'text-green-600' : 'text-red-600'}>
                {status?.tokenExists ? 'Yes' : 'No'}
              </span>
            </p>
            {status?.tokenInfo && (
              <p className="mb-2">
                <span className="font-medium">Token Info:</span> {status.tokenInfo}
              </p>
            )}
            {status?.userData && (
              <div className="mt-4 p-2 bg-gray-50 rounded">
                <h3 className="font-semibold">User Data</h3>
                <p><span className="font-medium">Name:</span> {status.userData.name}</p>
                <p><span className="font-medium">Email:</span> {status.userData.email}</p>
              </div>
            )}
            {status?.error && (
              <p className="mt-4 p-2 text-red-700 bg-red-50 rounded">{status.error}</p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleGoToSimulator}
              className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
            >
              Go to Simulator
            </button>
            {status?.authenticated ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
              >
                Login
              </button>
            )}
            <Link href="/" className="px-4 py-2 text-indigo-700 bg-white border border-indigo-300 rounded hover:bg-indigo-50">
              Back to Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 