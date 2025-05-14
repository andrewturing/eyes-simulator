'use client';

import LoginForm from '@/components/auth/LoginForm';
import Navbar from '@/components/layout/Navbar';

export default function LoginPage() {
  return (
    <main>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
        <LoginForm />
      </div>
    </main>
  );
} 