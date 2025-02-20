import RecordCard from './RecordCard';

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

interface MachineListProps {
  records: Record[];
  viewMode: 'machine' | 'tag';
}

type GroupedRecords = {
  [key: string]: Record[];
};

export default function MachineList({ records, viewMode }: MachineListProps) {
  const groupedRecords = records.reduce<GroupedRecords>((acc, record) => {
    if (viewMode === 'machine') {
      const key = record.machineNumber;
      acc[key] = acc[key] || [];
      acc[key].push(record);
    } else {
      // Group by tags
      record.tags.forEach(tagObj => {
        const key = tagObj.tag.name;
        acc[key] = acc[key] || [];
        if (!acc[key].find(r => r.id === record.id)) {
          acc[key].push(record);
        }
      });
    }
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(groupedRecords).map(([groupKey, groupRecords]) => (
        <div key={groupKey} className="border rounded-lg p-4">
          <div className="text-lg font-semibold mb-4">
            {viewMode === 'machine' ? `Machine Number: ${groupKey}` : `Tag: ${groupKey}`}
          </div>
          <div className="space-y-4">
            {groupRecords.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}