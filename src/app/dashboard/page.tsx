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
import MinioUpload from '../components/MinioUpload';
import Link from 'next/link';



interface Record {
  id: string;
  machineNumber: string;
  imageUrl: string;
  description: string;
  tags: string[];
  createdOn: string;
}

// Add this interface near the top with other interfaces
interface UploadedFile {
  name: string;
  url: string;
  uploadedAt: string;
}

export default function Dashboard() {
  // Add this state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const { data: session, status } = useSession();
  const [records, setRecords] = useState<Record[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [viewMode, setViewMode] = useState<'machine' | 'tag'>('machine');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <UserDetails />
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowUpload(true)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 sm:gap-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Upload PDF</span>
            </button>

            <Link
              href="/uploads"
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1 sm:gap-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>View Uploads</span>
            </Link>

            <button
              onClick={() => setShowAddRecord(true)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 sm:gap-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Record</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setViewMode('machine')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm rounded-lg transition-colors ${viewMode === 'machine'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-800'
              }`}
          >
            Machine Wise
          </button>
          <button
            onClick={() => setViewMode('tag')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm rounded-lg transition-colors ${viewMode === 'tag'
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

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Upload to Cloudinary</h3>
                  <div className="flex justify-center">
                    <PdfUpload
                      value={pdfUrl}
                      onChange={(url) => {
                        setPdfUrl(url);
                        console.log('PDF uploaded to Cloudinary:', url);
                        setShowUpload(false);
                      }}
                    />
                  </div>
                </div>

                {/* Add MinioUpload component */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Upload to MinIO Storage</h3>
                  <div className="flex justify-center">
                    <MinioUpload
                      acceptedFileTypes=".pdf"
                      maxSizeMB={10}
                      onUploadComplete={(fileUrl, fileName) => {
                        setPdfUrl(fileUrl);
                        setUploadedFiles(prev => [
                          {
                            name: fileName,
                            url: fileUrl,
                            uploadedAt: new Date().toISOString()
                          },
                          ...prev
                        ]);
                        console.log('PDF uploaded to MinIO:', fileUrl);
                        setShowUpload(false);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}