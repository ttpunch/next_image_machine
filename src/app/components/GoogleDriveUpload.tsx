"use client"

import { useState, useEffect } from 'react';

interface GoogleDriveUploadProps {
  onChange: (value: string) => void;
  value: string;
}

export default function GoogleDriveUpload({ onChange, value }: GoogleDriveUploadProps) {
  const [isLoading, setIsLoading] = useState(false);

  const initClient = () => {
    gapi.client.init({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      scope: 'https://www.googleapis.com/auth/drive.file',
    });
  };

  const uploadFile = async (file: File) => {
    setIsLoading(true);
    try {
      const accessToken = gapi.auth.getToken().access_token;
      const metadata = {
        name: file.name,
        mimeType: file.type,
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      });

      const result = await response.json();
      onChange(`https://drive.google.com/file/d/${result.id}/view`);
    } catch (error) {
      console.error('Error uploading to Google Drive:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      gapi.load('client:auth2', initClient);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="relative cursor-pointer hover:opacity-70 border-dashed border-2 border-gray-300 flex flex-col justify-center items-center h-[150px] w-[150px] rounded-lg">
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      {isLoading ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
          <span className="mt-2 text-sm text-gray-500">Uploading...</span>
        </div>
      ) : value ? (
        <div className="flex flex-col items-center">
          <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="mt-2 text-sm text-gray-500">File Uploaded</span>
          <a href={value} target="_blank" rel="noopener noreferrer" className="mt-1 text-xs text-blue-500 underline">
            View in Drive
          </a>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="mt-2 text-sm text-gray-500">Upload to Drive</span>
          <span className="mt-1 text-xs text-gray-400">Click to browse</span>
        </div>
      )}
    </div>
  );
}