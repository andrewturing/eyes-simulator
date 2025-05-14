'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/utils/useAuth';

export default function Navbar() {
  const { user, loading, logout } = useAuth(false); // Don't auto-redirect
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
  };

  return (
    <nav className="bg-indigo-600">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-xl font-bold text-white">
                Eyes Simulator
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="flex items-baseline ml-10 space-x-4">
                <Link href="/" className="px-3 py-2 text-sm font-medium text-white rounded-md hover:bg-indigo-500">
                  Home
                </Link>
                {user && (
                  <Link href="/simulator" className="px-3 py-2 text-sm font-medium text-white rounded-md hover:bg-indigo-500">
                    Simulator
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center ml-4 md:ml-6">
              {loading ? (
                <div className="text-white">Loading...</div>
              ) : user ? (
                <div className="relative ml-3">
                  <div>
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="flex items-center max-w-xs text-sm bg-indigo-600 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="p-2 text-white bg-indigo-700 rounded-full">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="ml-2 text-white">{user.name}</span>
                    </button>
                  </div>
                  {menuOpen && (
                    <div
                      className="absolute right-0 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                      <div
                        onClick={handleLogout}
                        className="block px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
                      >
                        Sign out
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex space-x-4">
                  <Link href="/login" className="px-4 py-2 text-sm font-medium text-white bg-indigo-700 rounded-md hover:bg-indigo-800">
                    Sign in
                  </Link>
                  <Link href="/register" className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white rounded-md hover:bg-gray-100">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="flex -mr-2 md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 text-indigo-200 rounded-md hover:text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {menuOpen ? (
                <svg className="block w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="block px-3 py-2 text-base font-medium text-white rounded-md hover:bg-indigo-500">
              Home
            </Link>
            {user && (
              <Link href="/simulator" className="block px-3 py-2 text-base font-medium text-white rounded-md hover:bg-indigo-500">
                Simulator
              </Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-indigo-700">
            {loading ? (
              <div className="px-5 text-white">Loading...</div>
            ) : user ? (
              <div>
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-10 h-10 text-white bg-indigo-700 rounded-full">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user.name}</div>
                    <div className="text-sm font-medium text-indigo-300">{user.email}</div>
                  </div>
                </div>
                <div className="px-2 mt-3 space-y-1">
                  <div
                    onClick={handleLogout}
                    className="block px-3 py-2 text-base font-medium text-white rounded-md cursor-pointer hover:bg-indigo-500"
                  >
                    Sign out
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col px-5 space-y-2">
                <Link href="/login" className="block px-3 py-2 text-base font-medium text-center text-white bg-indigo-700 rounded-md hover:bg-indigo-800">
                  Sign in
                </Link>
                <Link href="/register" className="block px-3 py-2 text-base font-medium text-center text-indigo-600 bg-white rounded-md hover:bg-gray-100">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 