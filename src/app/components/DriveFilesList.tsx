"use client";

import { useState, useEffect } from 'react';
import { fetchDriveFiles } from '../actions';
import { useSession } from 'next-auth/react';


export default function DriveFilesList() {
  const { data: session } = useSession();
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadDriveFiles();
  }, []);

  // Update the DriveFile interface
  interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    webViewLink: string;
    createdTime: string;
    category: string; // Make category required with a default value
  }
  
  // Update the loadDriveFiles function
  const loadDriveFiles = async () => {
    if (!session) {
      setError('Please sign in to view files');
      setLoading(false);
      return;
    }
  
    try {
      setLoading(true);
      const result = await fetchDriveFiles();
      
      if (result.success && result.data) {
        const validFiles = result.data
          .filter((file): file is Omit<typeof file, 'category'> & { category: string } => {
            const isValid = typeof file.id === 'string' &&
                   typeof file.name === 'string' &&
                   typeof file.mimeType === 'string' &&
                   typeof file.webViewLink === 'string' &&
                   typeof file.createdTime === 'string';
  
            return isValid;
          })
          .map(file => ({
            ...file,
            category: file.category || 'uncategorized' // Ensure category is always a string
          }));
  
        setFiles(validFiles as DriveFile[]);
      } else {
        throw new Error(result.error || 'Failed to fetch files');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(files.map(file => file.category || 'uncategorized'))];

  const filteredFiles = selectedCategory === 'all'
    ? files
    : files.filter(file => (file.category || 'uncategorized') === selectedCategory);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">PDF Documents</h2>
        <button
          onClick={loadDriveFiles}
          className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
        >
          Refresh
        </button>
      </div>
      
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-gray-500 text-center py-4">No PDF files found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map(file => (
            <div key={file.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 truncate" title={file.name}>
                    {file.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(file.createdTime).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={file.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}