import { NextRequest, NextResponse } from 'next/server';
import { Client as MinioClient } from 'minio';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Initialize MinIO client
const minioClient = new MinioClient({
  endPoint: '192.168.29.193',
  port: 9000,
  useSSL: false,
  accessKey: 'ZJiVVzvnOo2bv3p9MJ2G',
  secretKey: 'TwgeKY8vM5ShYgulpwPLepEDPTmmdArCZA9v9eXu'
});

const BUCKET_NAME = 'pdf';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if bucket exists
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    if (!bucketExists) {
      return NextResponse.json({ files: [] });
    }

    // List all objects in the bucket
    const objectsStream = minioClient.listObjects(BUCKET_NAME, '', true);
    
    const files = [];
    
    for await (const obj of objectsStream) {
      if (obj.name && obj.name.endsWith('.pdf')) {
        // Generate a presigned URL for each object (valid for 24 hours)
        const url = await minioClient.presignedGetObject(BUCKET_NAME, obj.name, 24 * 60 * 60);
        
        // Extract original filename from the object name (remove timestamp prefix)
        const originalName = obj.name.substring(obj.name.indexOf('-') + 1);
        
        files.push({
          name: originalName,
          fileName: obj.name, // Include the full file name with timestamp
          url: url,
          size: obj.size,
          uploadedAt: obj.lastModified ? obj.lastModified.toISOString() : new Date().toISOString()
        });
      }
    }
    
    // Sort by upload date (newest first)
    files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    
    return NextResponse.json({ files });
    
  } catch (error: any) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { message: `Error listing files: ${error.message}` },
      { status: 500 }
    );
  }
}