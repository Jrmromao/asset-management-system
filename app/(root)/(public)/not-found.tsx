"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();
  
  // Helper function to get suggestions based on the current path
  const getSuggestions = (path: string) => {
    if (path.includes('assetes')) return '/assets/';
    if (path.includes('accessorys')) return '/accessories/';
    if (path.includes('licence')) return '/license/';
    return null;
  };

  const suggestion = getSuggestions(pathname);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-5xl font-bold text-red-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="mb-4 text-gray-700">Sorry, the page you are looking for does not exist or has been moved.</p>
      
      {suggestion && (
        <div className="mb-6 text-center">
          <p className="text-gray-600">Did you mean to visit:</p>
          <Link href={suggestion}>
            <span className="text-blue-600 hover:underline">{suggestion}</span>
          </Link>
        </div>
      )}

      <div className="flex gap-4">
        <button 
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Go Back
        </button>
        <Link href="/">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Go to Home
          </button>
        </Link>
      </div>

      <div className="mt-8 text-sm text-gray-500">
        <p>Current path: {pathname}</p>
      </div>
    </div>
  );
} 