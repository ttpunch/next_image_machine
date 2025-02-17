import React from 'react';

function RecordCard({ finding }) {
  const severityColors = {
    LOW: 'bg-blue-100 text-blue-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800',
  };

  const statusColors = {
    OPEN: 'bg-red-100 text-red-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    RESOLVED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <span className="font-medium">Machine {finding.machine.machineNumber}</span>
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs ${severityColors[finding.severity]}`}>
            {finding.severity}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs ${statusColors[finding.status]}`}>
            {finding.status}
          </span>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        <p className="text-gray-700">{finding.textDescription}</p>
        
        {finding.findingTags && finding.findingTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {finding.findingTags.map(({ tag }) => (
              <span 
                key={tag.id}
                className="px-2 py-1 bg-gray-100 text-sm rounded-full"
              >
                {tag.tagName}
              </span>
            ))}
          </div>
        )}
        
        <div className="text-sm text-gray-500 flex justify-between items-center">
          <span>Created by: {finding.creator.username}</span>
          <span>{new Date(finding.createdOn).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

export default RecordCard;