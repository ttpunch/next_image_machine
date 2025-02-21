"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SearchBar from '../components/SearchBar';
import MachineList from '../components/MachineList';
import AddRecordForm from '../components/AddRecordForm';
import UserDetails from '../components/UserDetails';

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

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [viewMode, setViewMode] = useState<'machine' | 'tag'>('machine');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [records, setRecords] = useState<Record[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);

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

  const handleAddRecord = async (record: Record) => {
    await fetchRecords();
    setShowAddRecord(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="container mx-auto px-6 py-8">
        {/* Rest of your UI components */}
        <MachineList 
          records={filteredRecords} 
          viewMode={viewMode}
        />
        
        {showAddRecord && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Add New Record
                </h2>
                <button 
                  onClick={() => setShowAddRecord(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <AddRecordForm 
                onSubmit={handleAddRecord}
                onCancel={() => setShowAddRecord(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}