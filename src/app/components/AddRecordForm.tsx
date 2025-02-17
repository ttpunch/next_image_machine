import React, { useState } from 'react';

function AddRecordForm({ onSubmit, machineId, userId }) {
  const [formData, setFormData] = useState({
    textDescription: '',
    status: 'OPEN',
    severity: 'MEDIUM',
    tags: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/findings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          machineId: parseInt(machineId),
          textDescription: formData.textDescription,
          status: formData.status,
          severity: formData.severity,
          createdBy: userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create finding');
      }

      const newFinding = await response.json();
      onSubmit(newFinding);
      
      setFormData({
        textDescription: '',
        status: 'OPEN',
        severity: 'MEDIUM',
        tags: '',
      });
    } catch (error) {
      console.error('Error creating finding:', error);
      alert('Failed to create finding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form 
      className="max-w-2xl mx-auto p-6 space-y-4 bg-white rounded-lg shadow-lg"
      onSubmit={handleSubmit}
    >
      <textarea
        placeholder="Finding Description..."
        value={formData.textDescription}
        onChange={(e) => setFormData({ ...formData, textDescription: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm text-gray-600">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-gray-600">Severity</label>
          <select
            value={formData.severity}
            onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      <button 
        type="submit"
        disabled={isLoading}
        className={`w-full py-2 bg-blue-600 text-white rounded-lg transition-colors ${
          isLoading 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-blue-700'
        }`}
      >
        {isLoading ? 'Adding Finding...' : 'Add Finding'}
      </button>
    </form>
  );
}

export default AddRecordForm;