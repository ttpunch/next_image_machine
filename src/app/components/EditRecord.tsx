"use client"

import { useState } from 'react';
import { updateRecord } from '../actions';

interface EditRecordProps {
  record: {
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
  };
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditRecord({ record, onClose, onUpdate }: EditRecordProps) {
  const [machineNumber, setMachineNumber] = useState(record.machineNumber);
  const [description, setDescription] = useState(record.description);
  const [tags, setTags] = useState(record.tags.map(t => t.tag.name).join(', '));
  const [imageUrl, setImageUrl] = useState(record.imageUrl);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await updateRecord(record.id, {
        machineNumber,
        description,
        tags,
        imageUrl
      });

      if (result.success) {
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error('Error updating record:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full mx-4">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Edit Record</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Machine Number
            </label>
            <input
              type="text"
              value={machineNumber}
              onChange={(e) => setMachineNumber(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded-lg min-h-[100px]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}