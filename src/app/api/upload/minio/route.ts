import { NextRequest, NextResponse } from 'next/server';
import { Client as MinioClient } from 'minio';

// Initialize MinIO client with more detailed configuration
const minioClient = new MinioClient({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY ||"",
  secretKey: process.env.MINIO_SECRET_KEY ||"",
  pathStyle: true,  // Use path style instead of virtual hosted style
  region: 'us-east-1'  // Specify a region
});

const BUCKET_NAME = 'pdfupload';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting MinIO upload process');
    
    // List buckets to test connection
    console.log('Listing buckets to test connection');
    const buckets = await minioClient.listBuckets();
    console.log('Available buckets:', buckets.map(b => b.name));
    
    // Check if bucket exists
    console.log('Checking if bucket exists:', BUCKET_NAME);
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    console.log('Bucket exists:', bucketExists);
    
    if (!bucketExists) {
      console.log('Creating bucket:', BUCKET_NAME);
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log('Bucket created successfully');
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    console.log('File received:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    console.log('Generated unique filename:', uniqueFileName);
    
    // Get file buffer directly from the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload to MinIO directly from memory
    console.log('Uploading to MinIO from memory...');
    await minioClient.putObject(BUCKET_NAME, uniqueFileName, buffer, buffer.length, {
      'Content-Type': file.type,
    });
    console.log('File uploaded to MinIO successfully');
    
    // Generate URL (valid for 7 days)
    console.log('Generating presigned URL');
    const fileUrl = await minioClient.presignedGetObject(BUCKET_NAME, uniqueFileName, 7 * 24 * 60 * 60);
    console.log('Presigned URL generated:', fileUrl);
    
    return NextResponse.json({
      message: 'File uploaded successfully',
      fileUrl,
      fileName: file.name
    });
    
  } catch (error: unknown) {
    console.error('Upload error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to upload file';
      
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}