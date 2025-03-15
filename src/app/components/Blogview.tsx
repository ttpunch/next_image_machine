"use client"

import { useState, useEffect } from 'react';
import { getRecordById } from '../actions';

interface BlogRecord {
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
  images?: string[]; // Add support for multiple images
}

interface BlogViewProps {
  recordId: string;
  onClose: () => void;
}

export default function BlogView({ recordId, onClose }: BlogViewProps) {
  const [record, setRecord] = useState<BlogRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const loadRecord = async () => {
      try {
        const result = await getRecordById(recordId);
        if (result.success && result.data) {
          setRecord(result.data);
        } else {
          setRecord(null);
        }
      } catch (error) {
        console.error('Error loading record:', error);
        setRecord(null);
      } finally {
        setLoading(false);
      }
    };

    loadRecord();
  }, [recordId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!record) {
    return null;
  }

  // Combine main image with additional images if available
  const allImages = [record.imageUrl].concat(record.images || []).filter(Boolean);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold">Machine {record.machineNumber}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Image gallery with horizontal scrolling */}
          {allImages.length > 0 && (
            <div className="space-y-4">
              {/* Main image display */}
              <div className="relative w-full h-[400px] rounded-xl overflow-hidden">
                <img
                  src={selectedImage || allImages[0]}
                  alt={`Machine ${record.machineNumber}`}
                  className="object-contain w-full h-full"
                  onClick={() => {
                    // Open full-screen view when clicked
                    setSelectedImage(selectedImage || allImages[0]);
                  }}
                />
              </div>
              
              {/* Thumbnail gallery with horizontal scrolling */}
              {allImages.length > 1 && (
                <div className="overflow-x-auto pb-2">
                  <div className="flex space-x-2 min-w-max">
                    {allImages.map((img, index) => (
                      <div 
                        key={index} 
                        className={`w-24 h-24 flex-shrink-0 rounded-md overflow-hidden cursor-pointer border-2 ${
                          (selectedImage || allImages[0]) === img ? 'border-blue-500' : 'border-transparent'
                        }`}
                        onClick={() => setSelectedImage(img)}
                      >
                        <img 
                          src={img} 
                          alt={`Thumbnail ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Replace plain text paragraph with rich text renderer */}
          <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: record.description }} />
          </div>

          <div className="flex flex-wrap gap-2">
            {record.tags.map((tag) => (
              <span
                key={tag.tagId}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
              >
                {tag.tag.name}
              </span>
            ))}
          </div>

          <div className="text-sm text-gray-500">
            Created on: {new Date(record.createdOn).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>

      {/* Full-screen image viewer */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[60] flex flex-col"
          onClick={() => setSelectedImage(null)}
        >
          <div className="flex justify-end p-4">
            <button 
              className="text-white hover:text-gray-300 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}