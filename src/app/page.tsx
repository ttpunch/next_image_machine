'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import MachineList from '@/app/components/MachineList';
import AddRecordForm from '@/app/components/AddRecordForm';
import SearchBar from '@/app/components/SearchBar';
import UserDetails from '@/app/components/UserDetails';

export default function Home() {
  const { data: session, status } = useSession();
  interface Finding {
    machine: {
      machineNumber: string;
    };
    textDescription: string;
    findingTags: { tag: { tagName: string } }[];
  }

  const [findings, setFindings] = useState<Finding[]>([]);
  const [filteredFindings, setFilteredFindings] = useState<Finding[]>([]);
  const [viewMode, setViewMode] = useState('machine');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchFindings();
    }
  }, [status]);

  const fetchFindings = async () => {
    try {
      const response = await fetch('/api/findings');
      if (!response.ok) throw new Error('Failed to fetch findings');
      const data = await response.json();
      setFindings(data);
      setFilteredFindings(data);
    } catch (error) {
      console.error('Error fetching findings:', error);
    }
  };

  const handleSearch = (searchTerm: string) => {
    const filtered = findings.filter((finding) =>
      finding.machine.machineNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      finding.textDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      finding.findingTags.some(({ tag }) =>
        tag.tagName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredFindings(filtered);
  };

  const handleAddFinding = async () => {
    await fetchFindings();
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

      <button
        className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        onClick={() => setShowAddForm(!showAddForm)}
      >
        {showAddForm ? 'Cancel' : 'Add Finding'}
      </button>

      {showAddForm && (
        <AddRecordForm
          onSubmit={handleAddFinding}
          userId={session?.user?.id} // Use actual user ID from session
          machineId={1} // Replace with selected machine ID
        />
      )}

      <UserDetails />

      <MachineList
        findings={filteredFindings}
        viewMode={viewMode}
      />
    </div>
  );
}