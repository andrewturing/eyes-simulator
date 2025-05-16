'use client';

import React, { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import Navbar from '@/components/layout/Navbar';

// Loading fallback for Suspense
function LoginFormSkeleton() {
  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md animate-pulse">
      <div className="text-center">
        <div className="h-8 mx-auto bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 mx-auto mt-2 bg-gray-200 rounded w-2/3"></div>
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div className="h-10 bg-indigo-200 rounded"></div>
        <div className="h-4 mx-auto bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
} 