import React from 'react';

function RecordCard({ record }) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4 border-b bg-gray-50">
        <span className="font-medium">Machine {record.machineNumber}</span>
      </div>
      
      {record.image && (
        <div className="aspect-video relative">
          <img 
            src={record.image} 
            alt="Machine" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4 space-y-4">
        <p className="text-gray-700">{record.text}</p>
        
        <div className="flex flex-wrap gap-2">
          {record.tags.map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-gray-100 text-sm rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="text-sm text-gray-500">
          {new Date(record.createdOn).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

export default RecordCard; 