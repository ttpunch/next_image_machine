export default function SkeletonLoader() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-8 flex gap-4 animate-pulse">
          <div className="w-32">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="w-24 h-6 bg-gray-200 rounded-lg"></div>
          </div>

          <div className="w-32 space-y-2">
            <div className="h-4 bg-gray-200 rounded-full w-12"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded-full"></div>
              <div className="h-6 bg-gray-200 rounded-full w-3/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}