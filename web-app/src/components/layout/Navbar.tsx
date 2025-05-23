'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/utils/useAuth';

export default function Navbar() {
  const { user, loading, logout } = useAuth(false); // Don't auto-redirect
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-indigo-600 relative z-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <svg 
                className="h-12 w-36 mr-2 text-white logo-hover" 
                viewBox="0 0 567.2 144.7"
                aria-label="University of Liverpool logo"
              >
                <path fill="currentColor" d="M39.5 89.8c-2.3-.8-3.5-.8-5.5.5.3 0 1.8-.7 2.2-.5 0 .6 1.3.3 1.5 0 .5.2 1.6.3 1.8 0ZM23.1 41l-1.5-.4c.6.6 1.4 1.3 1.5 2.1V41Zm-5-23.6c-1.7-.6-2.8-.6-4.3.4.2 0 1.4-.5 1.8-.4 0 .5 1 .3 1 0 .5.2 1.4.3 1.6 0Zm26.3 102c.6.5 1.3 1.3 1.3 2v-2.1l-1.9-.5.6.6ZM63 17.5c-2-.5-3-.5-4.5.5.2 0 1.4-.5 1.8-.4 0 .5 1 .3 1 0 .5.2 1.4.3 1.6 0Z"></path>
                <path fill="currentColor" d="M94.4 2.9S76.6 0 48.2 0 1.9 2.9 1.9 2.9c-4.1 18-6.3 111 46.3 141.8C101 113.7 98.4 20 94.4 3Z" mask="url(#rb-a)"></path>
                <defs>
                  <path fill="currentColor" d="M19 39.6c-14-7.1 6.5-21.5-6-19.4-.1-.4.2-1.8-.6-1.5.5 1 0 2.7-.4 3.8 1.2.6.1 2-.2 2.8 0 0-.3-.6-.5-.6-.5 1-1.2.6-2 1 .1-.6-.6-1 .1-2-.4 0-.7-.3-.8-.4 1.3-1.1.8-2 2.8-1.1l.5-2.2c-.4-.1-.6-.4-.7-1 0 0-2.6-.7-3.5.8 0 0-2.3-3.8 6.6-3 2.2-2.1 9.1.7 10.3-1.8 0 0-2 3.7-3.7 5-1.7 1.3-5.6 7.9-.9 8.4-3.4-8.3 4.2 3.8 7.5-5.3-.6-3.3 12.4-.8 17.5-5.4 0 0-.5 3.3-2 7.1l-3.4-.5 3.1 1.4a23 23 0 0 1-2.8 5l-3-1.6 2.3 2.3c-1.4 1.7-3.2 3-5.5 3.7l-2.2-4.2 1.1 4.4a11 11 0 0 1-3.5 0c2.4 2.7 4.5 5.9 4.7 9 0 0-1.6-3.7-4.8-4.2l.6 1.8s-3.2-1.8-4.9-1.3c-1.4 3-.4 6.8-.4 6.8 2.3.5 4.4 1.7 4.4 1.7-4.5-.4-8.3-1.1-11.2 1 .2-2.4 5.4-3.5 5.4-3.5.4-3.4-2.5-6-3.9-7Z" id="rb-b"></path>
                  <mask id="rb-a">
                    <path fill="white" d="M94.4 2.9S76.6 0 48.2 0 1.9 2.9 1.9 2.9c-4.1 18-6.3 111 46.3 141.8C101 113.7 98.4 20 94.4 3Z"></path>
                    <path fill="black" d="m73.8 76.4-1.5-.8.6 1.6-1.2-.7.3.8c-1.9 1.9-10.5-9.5-23.6 2.7-1.3 1.2-1.4 1.6-3 0-10.5-10.7-22.7-2-22.7-2l-.7-.5.4-1-1 .7.7-1.9-1.7.9.6-1.4-1 .4 7-17.4c9.5-8.4 20.5-.4 20.5-.4s11.8-8.4 20 .3l6.7 17.5-1-.4.7 1.6Z"></path>
                    <use href="#rb-b"></use>
                    <use href="#rb-b" transform="translate(45)"></use>
                    <use href="#rb-b" transform="translate(17 67.5) scale(1.2575)"></use>
                  </mask>
                </defs>
                <path fill="currentColor" d="M66.8 41.1c.4.5 1 1.1 1 1.7v-1.7l-1.5-.4.5.4ZM29.7 62.6h.4c.3 0 .6-.4.8-1h.3l-.3 1-.1 1.2h-.3c0-.5 0-.9-.5-.8h-.3l-.5 1.6c-.2.6 0 .6.7.5v.3l-1.7.3-1.7.4.2-.3c.8-.2.9-.5 1.1-1.1l.9-2.7c.2-.8.2-1.1-.5-1l.1-.3a16 16 0 0 0 4.4-1l-.1 1.5h-.4c0-.9-.3-.7-1.3-.5-.6.1-.7.1-.9.8l-.3 1.2Zm4.3-1.5c.1-.7.2-1-.5-.9l.1-.3 1.2-.1 1.3-.2v.3c-.7.1-.9.4-1 1l-.6 2.7c-.2.9-.2 1.1.5 1.1v.3h-1.4l-1.5.2.1-.4c.7 0 .9-.3 1-1.1L34 61Zm3.2 2.6-.3.6c-.2.5.3.5.5.6v.3h-1l-.7-.1v-.4c.6 0 1-.7 1.2-1.3a578 578 0 0 0 1.8-3.9l.6.1.8 4.4.2 1c0 .3.4.5.5.6v.3a14.1 14.1 0 0 0-2.4-.5V65c.3 0 .7 0 .7-.3v-.8l-.1-.3-.9-.1-.7-.1-.2.3Zm1-.7h.7l-.4-2-1 2h.6Zm6.6.4-.3-.1c0-.8 0-1.5-.4-1.7-.5-.2-.6 0-.6.7l-.3 3c-.1.8 0 1.1.5 1.5v.3l-1.2-.6-1.3-.4v-.4c.8.2.8 0 .9-.8l.3-3c.1-.6.2-.9-.3-1-.6-.3-.6.3-.8 1H41l.2-1.8s1.1.2 2 .6c1 .4 1.7 1 1.7 1l-.1 1.7Zm6.9 3.7c.6-.4.6-.7.6-1.4l-.2-3c0-.8 0-1.2-.7-1v-.3a9.8 9.8 0 0 1 2.5-1v.4c-.7.2-.6.6-.6 1.4l.2 2.4c0 1 .1 1.5 1 1.2 1-.3 1.4-.8 1.5-1.9h.3v1.8c-1.4.3-2.9 1-3.3 1l-1.3.7v-.3Zm4.1-6.8h2.8v.2c-.6 0-.6.5-.6 1.3l.2 1.4c.1 1.2.5 1.8 1.5 1.8 1.2 0 1.1-.6 1-1.7l-.2-1.3c0-.3 0-.7-.2-1a.7.7 0 0 0-.6-.4v-.3h.9l.8.2v.3c-.2 0-.4.1-.5.4v1l.1.9c.2 1.6.4 2.4-1.5 2.5-1.3 0-2.5-.4-2.7-2.3l-.1-1.5c-.1-.8-.1-1.2-.8-1.2v-.3Zm10.7 5.4c.3.4.5.7.9.7v.3l-1.3-.2c-.3 0-.8 0-1.2-.2V66h.4v-.2L65 65l-.7-1.1-.4.6c-.1.2-.4.5-.3.8 0 .3.3.4.5.5v.3l-1-.2-.8-.1v-.4c.4 0 .7-.3.9-.6l.8-1.3-1-1.5c0-.3-.2-.4-.4-.6-.1-.3-.3-.3-.5-.4v-.3l1.2.2 1 .2.1.4c-.2 0-.5-.1-.4.2l.2.4.4.7.3-.4.3-.5c.2-.2-.2-.4-.5-.4v-.4l.8.1h.7v.4c-.3 0-.5.2-.7.6l-.7 1 1.7 2.4Z"></path>
                <path fill="currentColor" d="M163.9 114.1c-1 0-3.8 8.2-22 8.2-6.7 0-6-2-6-6.6V77.3c0-7 5.7-5 5.7-6.8 0-.9-.4-1-1.5-1-1.2 0-3 .3-7.6.3-3.8 0-6.3-.4-8-.4-1 0-1.5.2-1.5 1 0 1.6 6.6 1.1 6.6 5.2v40.1c0 3.7-.1 6-2.2 6.9-2.5 1.3-3.3 1.1-3.5 2 0 .7.5.8 1.2.8l9.7-.3c6-.1 12 .3 18 .3 3.5 0 5.2.2 7.7-2.6 2-2.1 4-4.9 4-7.7 0-.2 0-1-.6-1Z" id="rb-d"></path>
                <path fill="currentColor" d="M179.8 118.7V76.2c0-5.9 5.6-4 5.6-6 0-.6-.2-.8-1.5-.8-2.4 0-4.9.4-7.3.4-3 0-5.8-.4-8.7-.4-.6 0-.8.2-.8 1 0 1.7 6.3 0 6.4 5.8v40.5c0 7.9-6.2 5.3-6.2 7.6 0 .7.3 1.1 1.7 1.1 1.1 0 2.8-.3 7.6-.3 3.4 0 6.8.3 8.6.3 1.4 0 1.6-.2 1.6-.7 0-2.4-7-.6-7-6ZM243 69.4c-1 0-2.3.4-6 .4-1.8 0-3.5-.4-5.3-.4-.8 0-1.2.3-1.2 1 0 1.9 5 .4 5 4 .4 1.7-.5 4.2-1 5.4l-13.8 34c-.4.9-.6 2.2-1.4 2.2-.9 0-1.4-1.9-3.2-6l-13.8-32.6c-.3-.8-.7-2-.7-3.1 0-2.9 3.3-3 3.2-4 0-.5-.6-.8-1-.8l-6.3.3-7.3-.3c-.7 0-1.1.4-1.1 1 0 1.8 4 .3 6 5l19.6 46.2c.7 1.7 1.7 5 3 5 1.1 0 1.7-2.6 2.5-4.6L240 75.6c2.2-5.3 4.5-3.4 4.5-5.1 0-.7-.5-1-1.4-1Zm45.8 44.7c-1 0-3.7 8.2-22 8.2-6.6 0-6-2-6-6.6v-14.5c0-1.2-.2-2.6 1.5-2.6H274c6.6 0 4 7 6.4 7 .5 0 .9-.3.9-1l-.2-6.3.1-8c0-.6-.2-1.5-.8-1.5-2 0 .2 6.4-8 6.4h-8.5c-3.2 0-3 0-3-2.7V77.8c0-5.3-.2-5 7.4-5 3.1 0 11.4-.5 13.4 2.2 1.3 1.8 0 5.6 2 5.6.4 0 1.5-.6 1.5-9.4 0-1-.2-1.7-.8-1.7l-11.3.3c-3.3 0-7.4-.3-22.4-.3-2.3 0-2.8.3-2.8 1 0 .9 1.8 1 2.4 1.2 4.3.6 4.3 4.4 4.3 8v36c0 3.7-.2 6-2.2 7-2.6 1.2-3.4 1-3.5 2 0 .6.5.8 1.2.8 3.1 0 6.4-.3 9.6-.4 6-.1 12 .4 18 .4 3.5 0 5.3.1 7.8-2.7 1.9-2 4-4.9 4-7.7 0-.2-.1-1-.7-1Z"></path>
                <path fill="currentColor" d="M420.5 68.7c-16.2 0-29 12-29 28.4S402 126 419 126s30-11.5 30-29.3c0-16.3-12.5-28-28.6-28Zm2 55c-15.7 0-25.3-14.2-25.3-28.9 0-12.5 7.6-23.5 20.9-23.5 15.4 0 25.1 14 25.1 28.4s-9.2 24-20.7 24Z" id="rb-c"></path>
                <use href="#rb-c" transform="translate(63.5)" fill="currentColor" />
                <use href="#rb-d" transform="translate(392.5)" fill="currentColor" />
                <path fill="currentColor" d="M105.2 56.7h462.1v1.2H105.2zM204 17.5h3.5v27.7H204zm76.9 24.7h-14.7v-9.6h14.4v-3h-14.4v-9h14.7v-3.1h-18.1v27.8h18.1v-3.1zm-43.6 3.1 11.1-27.8h-4l-9.3 24-9.4-24h-3.9L233 45.3h4.3zm-70.1-22.2 16.2 22.2h3.3V17.5h-3.4v21.7l-16-21.7h-3.5v27.8h3.4V23.1zm-32 22.7c7.5 0 11.3-4.4 11.3-11.3v-17h-3.4v17c0 5-2.8 8.2-7.9 8.2s-7.8-3.2-7.8-8.3V17.5h-3.5v17c0 6.8 3.8 11.3 11.3 11.3Zm393.1-13.2h14.4v-3h-14.4v-9H543v-3.1h-18.1v27.8h3.4V32.6zm-93.4 12.7h3.5V33.5l10.9-16h-4l-8.7 12.9-8.5-12.9H424l10.9 16v11.8zm-37.5 0h3.4V20.6h8.8v-3.1h-21v3.1h8.8v24.7zm-95.8-11.1h5.6l7 11h4L310.9 34c3.8-.3 7.2-3 7.2-8s-3.6-8.4-8.7-8.4H298v27.8h3.5v-11Zm0-13.6h7.3c3.3 0 5.6 2.1 5.6 5.3s-2.3 5.3-5.6 5.3h-7.3V20.6ZM495 45.7c8.2 0 13.8-6.1 13.8-14.3s-5.6-14.3-13.8-14.3-13.8 6.1-13.8 14.3 5.6 14.4 13.8 14.4Zm0-25.6c6.2 0 10.2 4.8 10.2 11.3s-4 11.3-10.2 11.3-10.2-4.9-10.2-11.3 4-11.3 10.2-11.3Zm-126-2.6h3.5v27.7H369zm-25.7 25.2c-4 0-7-2-8.7-4l-2 2.6c2.2 2.6 5.8 4.4 10.6 4.4 7.4 0 10.2-4.1 10.2-8 0-10.4-16.4-6.9-16.4-13.1 0-2.6 2.4-4.4 5.7-4.4 3 0 5.9 1 8 3.3l2-2.5a13 13 0 0 0-9.8-4c-5.4 0-9.5 3.2-9.5 7.8 0 9.9 16.4 6 16.4 13 0 2.2-1.6 4.9-6.5 4.9Zm16.3 31.9c0-2.4 1.8-2.4 4.3-2.4 9.1 0 16.5 5 16.5 14.6 0 7.2-4.8 11-12.9 11-2.8 0-4.5-.4-5-.4s-.9.1-.9.7c0 1.4 4.6 1.8 5.4 1.8 16.8 0 19.2-12 19.2-15.2 0-11.8-11.1-15.3-21.2-15.3-3.8 0-5 .4-9 .4-4.6 0-7.4-.4-8-.4-.7 0-1 .6-1 1.2 0 2.9 6.4-2 6.4 7.5v38c0 8.7-6.2 6.2-6.2 8.4 0 .7.8 1 1.3 1 2.3 0 4.9-.4 8.6-.4 4.7 0 5.9.3 8.6.3 2 0 2.2-.4 2.2-1 0-2.6-8.2 1.5-8.2-9.9v-40Zm-38 22.2c5.6-2.2 10-7.5 10-13.7 0-15.2-17.4-13.6-18.7-13.6-4.1 0-8.6.3-13.2.3-4 0-3.6-.4-5-.4-1 0-1.6.5-1.6 1 0 2.7 6.7-.6 6.7 7v40.3c0 6-5.7 4.9-5.7 6.9 0 .4.3.8.8.8l9-.3c6.6 0 8.4.3 9 .3.7 0 1.4.2 1.4-.6 0-2.7-8.2-.2-8.2-7V101c0-.8-.5-2.2 2-2.2 9 0 7.7-.3 10.6 4.2l8.8 13.8c3 4.5 6 8.5 11.8 8.5.7 0 5.2 0 5.2-1 0-1.8-4 1.1-9.6-7.6l-13.2-20ZM306.2 75c0-3.1 1.7-3 4.5-3 7.8 0 15.1 3.3 15.1 13s-7.6 11.2-11 11.2c-3.7 0-8.6.4-8.6-1.1V75Z"></path>
              </svg>
              <Link href="/" className="text-xl font-bold text-white ml-2">
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
                <div className="relative ml-3" ref={dropdownRef}>
                  <div>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center max-w-xs text-sm bg-indigo-600 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
                      aria-expanded={dropdownOpen}
                      aria-haspopup="true"
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="p-2 text-white bg-indigo-700 rounded-full">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="ml-2 text-white">{user.name}</span>
                    </button>
                  </div>
                  {dropdownOpen && (
                    <div
                      className="absolute right-0 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu-button"
                      tabIndex={-1}
                    >
                      <div className="px-4 py-2 text-xs text-gray-500">
                        Signed in as
                        <div className="font-medium text-gray-900">{user.email}</div>
                      </div>
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      
                      <Link 
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        tabIndex={-1}
                      >
                        Your Profile
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                        role="menuitem"
                        tabIndex={-1}
                      >
                        Sign out
                      </button>
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