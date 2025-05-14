'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';
import ErrorBoundary from '@/components/ErrorBoundary';

// Simple error handler for dynamic import
const SimulatorLayout = dynamic(
  () => import('@/app/components/SimulatorLayout')
    .catch(error => {
      console.error('Failed to load SimulatorLayout:', error);
      // Return a simple fallback component
      const FallbackComponent = () => (
        <div className="flex flex-col items-center justify-center p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Unable to load simulator components
          </h2>
          <p className="mb-4">
            There was an error loading the simulator. This might be due to a temporary issue.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Reload Page
          </button>
        </div>
      );
      FallbackComponent.displayName = 'SimulatorFallback';
      return FallbackComponent;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-semibold text-indigo-600">Loading Simulator...</div>
      </div>
    ),
  }
);

export default function SimulatorPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Simulator page mounted');
    
    // Just a short delay for initial loading state
    setTimeout(() => {
      console.log('Simulator ready to display');
      setLoading(false);
    }, 300);
  }, []);

  if (loading) {
    return (
      <main>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-2xl font-semibold text-indigo-600">Loading Simulator...</div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <ErrorBoundary>
        <SimulatorLayout />
      </ErrorBoundary>
    </main>
  );
} 