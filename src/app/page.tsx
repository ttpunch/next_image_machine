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
    <div className="App">
      <h1>ImageKit Next.js quick start</h1>
      <ImageKitProvider publicKey={publicKey} urlEndpoint={urlEndpoint} authenticator={authenticator}>
        <div>
          <h2>File upload</h2>
          <IKUpload fileName="test-upload.png" onError={onError} onSuccess={onSuccess} />
        </div>
      </ImageKitProvider>
      {/* ...other SDK components added previously */}

     
    </div>
  );
}