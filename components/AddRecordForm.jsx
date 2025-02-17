import React, { useState } from 'react';

function AddRecordForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    machineNumber: '',
    image: null,
    text: '',
    tags: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const tags = formData.tags.split(',').map(tag => tag.trim());
    onSubmit({
      ...formData,
      tags,
      createdOn: new Date().toISOString(),
    });
    setFormData({
      machineNumber: '',
      image: null,
      text: '',
      tags: '',
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form 
      className="max-w-2xl mx-auto p-6 space-y-4 bg-white rounded-lg shadow-lg"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        placeholder="Machine Number"
        value={formData.machineNumber}
        onChange={(e) => setFormData({ ...formData, machineNumber: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      <div className="space-y-2">
        <label className="block text-sm text-gray-600">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full"
          required
        />
      </div>

      <textarea
        placeholder="Text..."
        value={formData.text}
        onChange={(e) => setFormData({ ...formData, text: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
        required
      />

      <input
        type="text"
        placeholder="Tags (comma-separated)"
        value={formData.tags}
        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      <button 
        type="submit"
        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Add Record
      </button>
    </form>
  );
}

export default AddRecordForm; 