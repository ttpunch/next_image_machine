"use client";

import { ImageKitProvider, IKImage, IKUpload } from "imagekitio-next";

const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;
const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;
const authenticator = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/imagekit-auth");

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const { signature, expire, token } = data;
    return { signature, expire, token };
  } catch (error: unknown) {
    throw new Error(`Authentication request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const onError = (err: unknown) => {
  console.log("Error", err);
};

const onSuccess = (res: unknown) => {
  console.log("Success", res);
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Image Upload
          </h1>
          <p className="text-lg text-gray-600">
            Upload and manage your images with ease
          </p>
        </div>

        <ImageKitProvider 
          publicKey={publicKey} 
          urlEndpoint={urlEndpoint} 
          authenticator={authenticator}
        >
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <IKUpload
                  fileName="test-upload.png"
                  onError={onError}
                  onSuccess={onSuccess}
                  className="w-full"
                  style={{
                    cursor: 'pointer',
                    fontSize: '16px',
                    color: '#4F46E5'
                  }}
                />
                <p className="mt-2 text-sm text-gray-600">
                  Supported formats: JPG, PNG, GIF
                </p>
              </div>
            </div>
          </div>
        </ImageKitProvider>
      </div>
    </div>
  );
}