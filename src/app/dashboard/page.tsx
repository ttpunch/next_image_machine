"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { fetchRecords } from '../actions';
import SearchBar from '../components/SearchBar';
import MachineList from '../components/MachineList';
import AddRecordForm from '../components/AddRecordForm';
import UserDetails from '../components/UserDetails';
import { ClientPageRoot } from 'next/dist/client/components/client-page';
import { Console } from 'console';

interface Record {
  id: string;
  machineNumber: string;
  imageUrl: string;
  description: string;
  tags: string[] 
  createdOn: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [records, setRecords] = useState<Record[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [viewMode, setViewMode] = useState<'machine' | 'tag'>('machine');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [searchResults, setSearchResults] = useState<Record[]>([]); // Fixed type

  const handleSearch = (searchTerm: string) => {
    // Implement search logic here
    console.log('Searching for:', searchTerm);
  };

  const handleAddRecord = (record: Record) => {
    setSearchResults(prev => [...prev, record]);
    setShowAddRecord(false);
  };

  useEffect(() => {
    if (status === 'authenticated') {
      loadRecords();
    }
  }, [status]);

  const loadRecords = async () => {
    const result = await fetchRecords();
    console.log(result);
    if (result.success && result.data) {
      // Transform the data to match the Record interface by extracting tag names
      const transformedData = result.data.map(record => ({
        ...record,
        tags: record.tags.map(tag => tag.tag.name)
       
      }));

      console.log("trasnsformed data;",transformedData);
     
      setRecords(transformedData);
      setFilteredRecords(transformedData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <UserDetails />
          <button 
            onClick={() => setShowAddRecord(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Record
          </button>
        </div>

        {/* View Mode Toggles */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setViewMode('machine')}
            className={`px-4 py-2 rounded-lg ${
              viewMode === 'machine' 
                ? 'bg-gray-800 text-white' 
                : 'bg-white text-gray-800'
            }`}
          >
            Machine Wise
          </button>
          <button
            onClick={() => setViewMode('tag')}
            className={`px-4 py-2 rounded-lg ${
              viewMode === 'tag' 
                ? 'bg-gray-800 text-white' 
                : 'bg-white text-gray-800'
            }`}
          >
            Tag Wise
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Records List */}
        <MachineList 
          records={searchResults.map(record => ({
            ...record,
            tags: record.tags.map(tagName => ({
              recordId: record.id,
              tagId: `tag-${tagName}`,
              tag: { name: tagName }
            }))
          }))} 
          viewMode={viewMode}
        /> {/* Fixed prop name */}

        {/* Add Record Modal */}
        {showAddRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add New Record</h2>
                <button 
                  onClick={() => setShowAddRecord(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <AddRecordForm 
                onSubmit={(record) => {
                  const transformedRecord = {
                    ...record,
                    tags: record.tags.map(tag => tag.tag.name)
                  };
                  handleAddRecord(transformedRecord);
                }}
                onCancel={() => setShowAddRecord(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}