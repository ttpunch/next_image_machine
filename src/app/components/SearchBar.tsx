import { useState } from 'react';

export default function SearchBar({ onSearch }: { onSearch: (term: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className="flex gap-4">
      <input
        type="text"
        placeholder="Search...."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1 px-4 py-2 border rounded-lg bg-transparent"
      />
      <button 
        onClick={handleSubmit}
        className="px-6 py-2 border rounded-lg hover:bg-gray-700"
      >
        submit
      </button>
    </div>
  );
}