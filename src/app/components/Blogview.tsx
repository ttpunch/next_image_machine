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
}

interface BlogViewProps {
  recordId: string;
  onClose: () => void;
}

export default function BlogView({ recordId, onClose }: BlogViewProps) {
  const [record, setRecord] = useState<BlogRecord | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
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
          {record.imageUrl && (
            <div className="relative w-full h-[400px] rounded-xl overflow-hidden">
              <img
                src={record.imageUrl}
                alt={`Machine ${record.machineNumber}`}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          <div className="prose max-w-none">
            <p className="text-lg leading-relaxed">{record.description}</p>
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
    </div>
  );
}