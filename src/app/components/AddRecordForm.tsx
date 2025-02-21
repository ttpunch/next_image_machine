"use client"

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { createRecord } from '../actions';


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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
      alert(error instanceof Error ? error.message : 'Failed to create record');
    } finally {
      setIsLoading(false);
    }
};

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Machine Number"
        value={formData.machineNumber}
        onChange={(e) => setFormData({ ...formData, machineNumber: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg bg-white text-black"
        required
      />

      <div className="flex gap-4">
        <div className="w-32">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
            className="hidden text-black"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="w-full aspect-square border rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-700 text-black"
          >
            {formData.image ? (
              <img
                src={URL.createObjectURL(formData.image)}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-black bg-white w-full h-full flex items-center justify-center rounded-lg ">
                Add Image
              </div>
            )}
          </label>
        </div>

        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="flex-1 p-2 border rounded-lg bg-white text-black"
          required
        />

        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          className="w-32 px-4 py-2 border rounded-lg bg-white text-black"
        />
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg bg-white text-black hover:bg-gray-100 transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add Record'}
        </button>
      </div>
    </form>
  );
}