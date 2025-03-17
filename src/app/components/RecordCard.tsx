import { useState } from 'react';
import BlogView from './Blogview';
import EditRecord from './EditRecord';
import { deleteRecord } from '../actions';

interface RecordProps {
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
    createdOn: string;
  };
}

export default function RecordCard({ record }: RecordProps) {
  const [showBlog, setShowBlog] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setIsDeleting(true);
      try {
        const result = await deleteRecord(record.id);
        if (result.success) {
          window.location.reload();
        } else {
          alert('Failed to delete record');
        }
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Failed to delete record');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <>
      <div className="bg-blue-100 border border-gray-100 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {/* Image Section */}
          <div className="w-full sm:w-40 flex justify-center sm:block">
            <div className="w-40 sm:w-full aspect-square rounded-lg overflow-hidden shadow-sm border border-gray-100">
              {record.imageUrl ? (
                <img 
                  src={record.imageUrl} 
                  alt={`Machine ${record.machineNumber}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
         
          </div>

          {/* Content Section */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 max-h-52 overflow-y-auto">
              {/* Replace textarea with a div that renders HTML content */}
              <div 
                className="w-full min-h-[120px] sm:min-h-[150px] p-3 border border-gray-200 rounded-lg bg-gray-50/50 text-gray-700 overflow-auto"
              >
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: record.description }}
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
              <button 
                onClick={() => setShowBlog(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="hidden sm:inline">View Details</span>
                <span className="sm:hidden">View</span>
              </button>
              <button 
                onClick={() => setShowEdit(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span className="hidden sm:inline">Edit</span>
                <span className="sm:hidden">Edit</span>
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 disabled:opacity-50 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline">{isDeleting ? 'Deleting...' : 'Delete'}</span>
                <span className="sm:hidden">{isDeleting ? '...' : 'Delete'}</span>
              </button>
            </div>
          </div>

          {/* Tags and Date Section */}
          <div className="w-full sm:w-48 flex flex-col">
            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {record.tags.map((tagObj) => (
                  <span
                    key={tagObj.tagId}
                    className="inline-flex items-center px-3 py-1 bg-white text-sm text-gray-700 rounded-full border border-gray-200 shadow-sm"
                  >
                    {tagObj.tag.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-auto pt-4 text-xs text-right text-gray-500">
              Created on: {new Date(record.createdOn).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {showBlog && (
        <BlogView 
          recordId={record.id} 
          onClose={() => setShowBlog(false)} 
        />
      )}

      {showEdit && (
        <EditRecord
          record={record}
          onClose={() => setShowEdit(false)}
          onUpdate={() => window.location.reload()}
        />
      )}
    </>
  );
}