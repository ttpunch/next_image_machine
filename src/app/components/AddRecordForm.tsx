"use client";

import { useEffect, useRef, useState } from 'react';
import { createRecord } from '../actions';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import {  fetchRecentTags } from '../actions';
import Image from 'next/image';

// Dynamically import the QuillEditor to avoid SSR issues
const QuillEditor = dynamic(() => import('./QuillEditor'), { 
  ssr: false,
  loading: () => <div className="min-h-[200px] bg-gray-100 animate-pulse rounded-md"></div>
});



// Update the Record interface to match the one in page.tsx
interface Record {
  id: string;
  machineNumber: string;
  imageUrl: string;
  description: string;
  tags: Array<{
    recordId: string;
    tagId: string;
    tag: {
      name: string;
    };
  }>;
  createdOn: string;
}

interface AddRecordFormProps {
  onSubmit: (record: Record) => void;
  onCancel: () => void;
}

export default function AddRecordForm({ onSubmit, onCancel }: AddRecordFormProps) {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    machineNumber: '',
    description: '',
    tags: '',
    image: null as File | null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recentTags, setRecentTags] = useState<Array<{id: string, name: string, count: number}>>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  // Fetch recent tags when component mounts
  useEffect(() => {
    const getRecentTags = async () => {
      if (status === 'authenticated') {
        setIsLoadingTags(true);
        try {
          const result = await fetchRecentTags(5);
          if (result.success && result.data) {
            setRecentTags(result.data);
          }
        } catch (error) {
          console.error('Error fetching tags:', error);
        } finally {
          setIsLoadingTags(false);
        }
      }
    };
    
    getRecentTags();
  }, [status]);

  // Function to add a tag to the input
  const addTag = (tagName: string) => {
    const currentTags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
    if (!currentTags.includes(tagName)) {
      const newTags = currentTags.length > 0 
        ? `${formData.tags}, ${tagName}` 
        : tagName;
      setFormData({ ...formData, tags: newTags });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (status !== 'authenticated' || !session?.user?.id) {
        throw new Error('Authentication required');
      }

      // Handle image upload first if there's an image
      let imageUrl = '';
      if (formData.image) {
        const imageData = new FormData();
        imageData.append('file', formData.image);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: imageData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }
        
        const uploadResult = await uploadResponse.json();
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload image');
        }
        imageUrl = uploadResult.url;
      }

      const result = await createRecord({
        machineNumber: formData.machineNumber,
        description: formData.description,
        tags: formData.tags,
        imageUrl: imageUrl,
        userId: ''
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      setFormData({
        machineNumber: '',
        description: '',
        tags: '',
        image: null,
      });

      if (result.data) {
        onSubmit(result.data as unknown as Record);
      }
    } catch (error) {
      console.error('Error creating record:', error);
      setError(error instanceof Error ? error.message : 'Failed to create record');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Image upload */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Machine Image</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors bg-gray-50"
              >
                {formData.image ? (
                  <div className="relative w-full h-full">
                    <div className="relative w-full h-full">
                      <Image
                        src={URL.createObjectURL(formData.image)}
                        alt="Preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <span className="text-white text-sm font-medium">Change Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">
                      <span className="font-medium text-indigo-600 hover:text-indigo-500">
                        Upload an image
                      </span>
                      <span className="block"> or drag and drop</span>
                    </p>
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Right column - Form fields */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <label htmlFor="machine-number" className="block text-sm font-medium text-gray-700 mb-1">
                Machine Number
              </label>
              <input
                id="machine-number"
                type="text"
                placeholder="Enter machine number"
                value={formData.machineNumber}
                onChange={(e) => setFormData({ ...formData, machineNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-black"
                required
              />
            </div>

            <div>
              {/* Replace the description textarea with QuillEditor */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <QuillEditor
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  placeholder="Enter machine description..."
                />
              </div>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                id="tags"
                type="text"
                placeholder="Enter tags separated by commas"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-black"
              />
              
              <div className="mt-2">
                {isLoadingTags ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse flex space-x-1">
                      <div className="h-5 w-12 bg-gray-200 rounded"></div>
                      <div className="h-5 w-16 bg-gray-200 rounded"></div>
                      <div className="h-5 w-10 bg-gray-200 rounded"></div>
                    </div>
                    <span className="text-xs text-gray-500">Loading tags...</span>
                  </div>
                ) : recentTags.length > 0 ? (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Recent tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {recentTags.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => addTag(tag.name)}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No recent tags found</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}