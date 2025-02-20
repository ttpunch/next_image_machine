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
  return (
    <div className="border rounded-lg p-4 flex gap-4">
      <div className="w-32">
        <div className="aspect-square border rounded-lg flex items-center justify-center">
          {record.imageUrl ? (
            <img 
              src={record.imageUrl} 
              alt="Record" 
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-center">No Image</div>
          )}
        </div>
      </div>
      
      <div className="flex-1">
        <textarea 
          readOnly 
          value={record.description}
          className="w-full h-24 p-2 border rounded-lg bg-transparent"
        />
      </div>

      <div className="w-32">
        <div className="border rounded-lg p-2 h-full">
          <div className="text-sm mb-2">Tags:</div>
          <div className="space-y-1">
            {record.tags.map((tagObj) => (
              <div key={tagObj.tagId} className="text-sm">
                {tagObj.tag.name}
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs mt-2 text-right">
          created on: {new Date(record.createdOn).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}