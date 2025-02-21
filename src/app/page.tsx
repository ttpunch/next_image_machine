'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import MachineList from '@/app/components/MachineList';
import AddRecordForm from '@/app/components/AddRecordForm';
import SearchBar from '@/app/components/SearchBar';
import UserDetails from '@/app/components/UserDetails';

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

export default function Home() {
  const { data: session, status } = useSession();
  const [records, setRecords] = useState<Record[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [viewMode, setViewMode] = useState<'machine' | 'tag'>('machine');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchRecords();
    }
  }, [status]);

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/records');
      if (!response.ok) throw new Error('Failed to fetch records');
      const data = await response.json();
      setRecords(data);
      setFilteredRecords(data);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredRecords(records);
      return;
    }

    const filtered = records.filter((record) =>
      record.machineNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.tags.some(tagObj => 
        tagObj.tag.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredRecords(filtered);
  };

  const handleAddRecord = (newRecord: Record) => {
    fetchRecords(); // Remove async/await since onSubmit doesn't expect a Promise
    setShowAddForm(false);
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div>Please log in to view this page.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <UserDetails />
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Add Record'}
        </button>
      </div>

      <div className="flex gap-4">
        <button
          className={`px-4 py-2 rounded-lg border ${
            viewMode === 'machine'
              ? 'bg-gray-800 text-white'
              : 'bg-white text-gray-800'
          }`}
          onClick={() => setViewMode('machine')}
        >
          Machine Wise
        </button>
        <button
          className={`px-4 py-2 rounded-lg border ${
            viewMode === 'tag'
              ? 'bg-gray-800 text-white'
              : 'bg-white text-gray-800'
          }`}
          onClick={() => setViewMode('tag')}
        >
          Tag Wise
        </button>
      </div>

      <SearchBar onSearch={handleSearch} />

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-black">Add New Record</h2>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <AddRecordForm
              onSubmit={handleAddRecord}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      <MachineList
        records={filteredRecords}
        viewMode={viewMode}
      />
    </div>
  );
}