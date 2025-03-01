"use client";

import { useState, useEffect, useCallback } from "react";

interface GoogleDriveUploadProps {
  onChange: (value: string, fileName: string) => void;
  value: string;
}

declare global {
  interface Window {
    google: any; // Type for Google Identity Services
  }
}

export default function GoogleDriveUpload({ onChange, value }: GoogleDriveUploadProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Load Google Identity Services script and initialize token client
  useEffect(() => {
    const loadGoogleIdentityServices = () => {
      console.log("Attempting to load Google Identity Services...");
      if (window.google) {
        console.log("Google Identity Services already available");
        initializeTokenClient();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = () => {
        console.log("Google Identity Services script loaded successfully");
        initializeTokenClient();
      };
      script.onerror = () => {
        console.error("Failed to load Google Identity Services script");
        setError("Failed to load authentication API");
        setIsApiLoaded(false); // Ensure we don't stay stuck
      };
      document.body.appendChild(script);
    };

    const initializeTokenClient = () => {
      console.log("Initializing token client...");
      if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        console.error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID in environment variables");
        setError("Configuration error: Missing Google Client ID");
        setIsApiLoaded(false);
        return;
      }

      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          scope: "https://www.googleapis.com/auth/drive.file",
          callback: (response: any) => {
            if (response.error) {
              console.error("Token request failed:", response);
              setError(`Authentication failed: ${response.error_description || response.error}`);
              setIsAuthenticated(false);
              return;
            }
            console.log("Access token received:", response.access_token);
            setAccessToken(response.access_token);
            setIsAuthenticated(true);
            setError(null);
          },
        });
        console.log("Token client initialized successfully");
        setTokenClient(client);
        setIsApiLoaded(true); // Set to true once client is ready
      } catch (err) {
        console.error("Error initializing token client:", err);
        setError("Failed to initialize authentication client");
        setIsApiLoaded(false);
      }
    };

    loadGoogleIdentityServices();

    return () => {
      console.log("Cleaning up Google Identity Services script...");
      const scripts = document.querySelectorAll('script[src="https://accounts.google.com/gsi/client"]');
      scripts.forEach((script) => script.remove());
    };
  }, []);

  // Handle authentication by requesting an access token
  const handleAuth = useCallback(async () => {
    if (!isApiLoaded || !tokenClient) {
      console.error("Google API not loaded or token client not initialized");
      setError("Authentication API not ready");
      return;
    }

    if (!isAuthenticated) {
      console.log("Requesting access token...");
      try {
        tokenClient.requestAccessToken();
      } catch (error) {
        console.error("Error requesting access token:", error);
        setError("Failed to request authentication");
      }
    } else {
      console.log("Already authenticated, skipping token request");
    }
  }, [isApiLoaded, tokenClient, isAuthenticated]);

  // Upload file to Google Drive
  const uploadFile = useCallback(
    async (file: File) => {
      if (!isApiLoaded) {
        console.error("Google API not loaded");
        setError("Google API not ready");
        return;
      }

      if (!isAuthenticated || !accessToken) {
        console.log("Not authenticated, triggering auth...");
        await handleAuth();
        if (!isAuthenticated || !accessToken) {
          console.error("Authentication failed or no access token after auth");
          return;
        }
      }

      setIsLoading(true);
      setError(null);
      try {
        const metadata = {
          name: file.name,
          mimeType: file.type || "application/pdf",
        };

        const form = new FormData();
        form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
        form.append("file", file);

        const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: form,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        const fileUrl = `https://drive.google.com/file/d/${result.id}/view`;
        console.log("File uploaded successfully:", fileUrl);
        onChange(fileUrl, file.name);
      } catch (error: any) {
        console.error("Upload error:", error);
        setError("Upload failed: " + (error.message || "Unknown error"));
      } finally {
        setIsLoading(false);
      }
    },
    [isApiLoaded, isAuthenticated, accessToken, handleAuth, onChange]
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        console.log("File selected:", file.name);
        uploadFile(file);
      }
    },
    [uploadFile]
  );

  return (
    <div className="relative cursor-pointer hover:opacity-70 border-dashed border-2 border-gray-300 flex flex-col justify-center items-center h-[150px] w-[150px] rounded-lg">
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isLoading || !isApiLoaded}
      />
      {isLoading ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
          <span className="mt-2 text-sm text-gray-500">Uploading...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center text-red-500">
          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="mt-2 text-sm text-center">{error}</span>
        </div>
      ) : !isApiLoaded ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400" />
          <span className="mt-2 text-sm text-gray-500">Loading API...</span>
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