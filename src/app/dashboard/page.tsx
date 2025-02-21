"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { fetchRecords } from '../actions';
import SearchBar from '../components/SearchBar';
import MachineList from '../components/MachineList';
import AddRecordForm from '../components/AddRecordForm';
import UserDetails from '../components/UserDetails';
import SkeletonLoader from '../components/SkeletonLoader';
import PdfUpload from '../components/PdfUpload';

interface Record {
  id: string;
  machineNumber: string;
  imageUrl: string;
  description: string;
  tags: string[];
  createdOn: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [records, setRecords] = useState<Record[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [viewMode, setViewMode] = useState<'machine' | 'tag'>('machine');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      loadRecords();
    }
  }, [status]);

  const loadRecords = async () => {
    setLoading(true);
    const result = await fetchRecords();
    if (result.success && result.data) {
      const formattedRecords = result.data.map(record => ({
        ...record,
        tags: record.tags.map(tag => 
          typeof tag === 'object' ? tag.tag.name : tag
        )
      }));
      setRecords(formattedRecords);
      setFilteredRecords(formattedRecords);
    }
    setLoading(false);
  };

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredRecords(records);
      return;
    }

    const filtered = records.filter((record) =>
      record.machineNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.tags.some(tag => 
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredRecords(filtered);
  };

  const handleAddRecord = async (record: Record) => {
    await loadRecords();
    setShowAddRecord(false);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Please sign in to access this page</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-black">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <UserDetails />
          <div className="flex gap-3">
            <button 
              onClick={() => setShowUpload(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload PDF
            </button>
            
            <button 
              onClick={() => setShowAddRecord(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Record
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setViewMode('machine')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'machine' 
                ? 'bg-gray-800 text-white' 
                : 'bg-white text-gray-800'
            }`}
          >
            Machine Wise
          </button>
          <button
            onClick={() => setViewMode('tag')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'tag' 
                ? 'bg-gray-800 text-white' 
                : 'bg-white text-gray-800'
            }`}
          >
            Tag Wise
          </button>
        </div>

        <div className="mb-6">
          <SearchBar onSearch={handleSearch} />
        </div>

        {loading ? (
          <SkeletonLoader />
        ) : (
          <MachineList 
            records={filteredRecords.map(record => ({
              ...record,
              tags: record.tags.map(tagName => ({
                recordId: record.id,
                tagId: `tag-${tagName}`,
                tag: { name: tagName }
              }))
            }))} 
            viewMode={viewMode}
          />
        )}

        {showAddRecord && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add New Record</h2>
                <button 
                  onClick={() => setShowAddRecord(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
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
        {showUpload && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Upload PDF Document</h2>
                <button 
                  onClick={() => setShowUpload(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  <PdfUpload
                    value=""
                    onChange={(url) => {
                      // Handle the uploaded PDF URL
                      console.log('PDF uploaded:', url);
                      setShowUpload(false);
                    }}
                  />
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Click to upload or drag and drop your PDF file here
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}