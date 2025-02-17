import React from 'react';
import RecordCard from './RecordCard';

function MachineList({ findings, viewMode }) {
  const groupedFindings = findings.reduce((acc, finding) => {
    if (viewMode === 'machine') {
      const key = finding.machine.machineNumber;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(finding);
    } else {
      finding.findingTags.forEach(({ tag }) => {
        if (!acc[tag.tagName]) {
          acc[tag.tagName] = [];
        }
        acc[tag.tagName].push(finding);
      });
    }
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(groupedFindings).map(([key, groupFindings]) => (
        <div key={key} className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">
            {viewMode === 'machine' ? `Machine ${key}` : `Tag: ${key}`}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupFindings.map(finding => (
              <RecordCard key={finding.id} finding={finding} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default MachineList;