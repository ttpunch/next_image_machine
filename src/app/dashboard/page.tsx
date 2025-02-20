"use client"
import { useState } from 'react';
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
    tag: { name: string };
  }>;
  createdOn: string;
}

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<'machine' | 'tag'>('machine');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [searchResults, setSearchResults] = useState<Record[]>([]);

  const handleSearch = (searchTerm: string) => {
    console.log('Searching for:', searchTerm);
  };

  const handleAddRecord = (record: Record) => {
    setSearchResults(prev => [...prev, record]);
    setShowAddRecord(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
          <UserDetails />
          <button 
            onClick={() => setShowAddRecord(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl 
            hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 
            shadow-md hover:shadow-xl font-medium"
          >
            + Add New Record
          </button>
        </div>

        {/* View Mode Toggles */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setViewMode('machine')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              viewMode === 'machine' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105' 
                : 'bg-white/80 text-gray-700 hover:bg-white/90'
            }`}
          >
            Machine View
          </button>
          <button
            onClick={() => setViewMode('tag')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              viewMode === 'tag' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105' 
                : 'bg-white/80 text-gray-700 hover:bg-white/90'
            }`}
          >
            Tag View
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Records List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <MachineList records={searchResults} viewMode={viewMode} />
        </div>

        {/* Add Record Modal */}
        {showAddRecord && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 shadow-2xl transform transition-all duration-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Add New Record
                </h2>
                <button 
                  onClick={() => setShowAddRecord(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
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