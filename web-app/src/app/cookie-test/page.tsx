'use client';

import { useState, useEffect } from 'react';

interface TestResult {
  success?: boolean;
  message?: string;
  error?: string;
}

export default function CookieTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [cookies, setCookies] = useState<string[]>([]);

  const fetchTestCookie = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/set-test-cookie', {
        credentials: 'include'
      });
      const data = await response.json();
      setResult(data);
      
      // Wait a bit then check debug endpoint
      setTimeout(checkDebug, 500);
    } catch (error) {
      console.error('Error setting test cookie:', error);
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };
  
  const checkDebug = async () => {
    try {
      const response = await fetch('/api/debug', {
        credentials: 'include'
      });
      const data = await response.json();
      setCookies(data.cookies || []);
    } catch (error) {
      console.error('Error checking debug:', error);
    }
  };

  useEffect(() => {
    checkDebug();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Cookie Test Page</h1>
      
      <div className="mb-6">
        <button 
          onClick={fetchTestCookie}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Setting...' : 'Set Test Cookie'}
        </button>
      </div>
      
      {result && (
        <div className="p-4 border rounded mb-6">
          <h2 className="font-semibold mb-2">Test Result:</h2>
          <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
      
      <div className="p-4 border rounded">
        <h2 className="font-semibold mb-2">Detected Cookies:</h2>
        {cookies.length === 0 ? (
          <p className="text-red-500">No cookies detected!</p>
        ) : (
          <ul className="list-disc list-inside">
            {cookies.map((cookie, i) => (
              <li key={i}>{cookie}</li>
            ))}
          </ul>
        )}
        <button 
          onClick={checkDebug}
          className="mt-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Refresh
        </button>
      </div>
      
      <div className="mt-6">
        <a href="/auth-test" className="text-blue-500 hover:underline">Go to Auth Test Page</a>
      </div>
    </div>
  );
} 