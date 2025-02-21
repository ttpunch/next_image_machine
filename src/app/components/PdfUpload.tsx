"use client"

import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';

interface PdfUploadProps {
  onChange: (value: string) => void;
  value: string;
}

export default function PdfUpload({ onChange, value }: PdfUploadProps) {
  const [resource, setResource] = useState<any>();

  return (
    <CldUploadWidget
      signatureEndpoint="/api/sign-cloudinary-params"
      onSuccess={(result: any, { widget }) => {
        setResource(result?.info);
        if (result?.info && typeof result.info === 'object' && 'secure_url' in result.info) {
          onChange(result.info.secure_url);
        }
      }}
      onQueuesEnd={(result, { widget }) => {
        widget.close();
      }}
      options={{
        maxFiles: 1,
        sources: ['local'],
        resourceType: "raw",
        clientAllowedFormats: ["pdf"],
        maxFileSize: 100000000,
        folder: 'pdfs',
      }}
    >
      {({ open }) => {
        function handleOnClick() {
          setResource(undefined);
          open();
        }
        
        return (
          <div
            onClick={handleOnClick}
            className="relative cursor-pointer hover:opacity-70 border-dashed border-2 border-gray-300 flex flex-col justify-center items-center h-[150px] w-[150px] rounded-lg"
          >
            {value ? (
              <div className="flex flex-col items-center">
                <svg 
                  className="h-12 w-12 text-red-500" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
                  />
                </svg>
                <span className="mt-2 text-sm text-gray-500">PDF Uploaded</span>
                <span className="mt-1 text-xs text-blue-500 underline">Click to change</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <svg 
                  className="h-12 w-12 text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                  />
                </svg>
                <span className="mt-2 text-sm text-gray-500">Upload PDF</span>
                <span className="mt-1 text-xs text-gray-400">Click to browse</span>
              </div>
            )}
          </div>
        );
      }}
    </CldUploadWidget>
  );
}