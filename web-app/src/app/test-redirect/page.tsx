'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Wait a moment and then redirect to simulator
    const timer = setTimeout(() => {
      console.log('Redirecting to simulator from test page');
      router.push('/simulator');
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="mb-4 text-2xl font-bold">Test Redirect Page</h1>
      <p className="mb-4">You will be redirected to the simulator in 2 seconds...</p>
      <div className="flex space-x-4">
        <button 
          onClick={() => router.push('/simulator')}
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Go to Simulator
        </button>
        <button 
          onClick={() => router.push('/')}
          className="px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
} 