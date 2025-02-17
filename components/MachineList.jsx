import React from 'react';
import RecordCard from './RecordCard';

function MachineList({ records, viewMode }) {
  const groupedRecords = records.reduce((acc, record) => {
    if (viewMode === 'machine') {
      if (!acc[record.machineNumber]) {
        acc[record.machineNumber] = [];
      }
      acc[record.machineNumber].push(record);
    } else {
      record.tags.forEach(tag => {
        if (!acc[tag]) {
          acc[tag] = [];
        }
        acc[tag].push(record);
      });
    }
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(groupedRecords).map(([key, groupRecords]) => (
        <div key={key} className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">
            {viewMode === 'machine' ? `Machine ${key}` : `Tag: ${key}`}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupRecords.map(record => (
              <RecordCard key={record.id} record={record} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default MachineList; 