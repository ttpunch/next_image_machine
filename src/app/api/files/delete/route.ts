import { NextRequest, NextResponse } from 'next/server';
import { Client as MinioClient } from 'minio';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Initialize MinIO client
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
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get the filename from the request body
    const { fileName } = await request.json();
    
    if (!fileName) {
      return NextResponse.json({ message: 'File name is required' }, { status: 400 });
    }

    // Check if bucket exists
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    if (!bucketExists) {
      return NextResponse.json({ message: 'Bucket does not exist' }, { status: 404 });
    }

    // Delete the object
    await minioClient.removeObject(BUCKET_NAME, fileName);
    
    return NextResponse.json({ 
      message: 'File deleted successfully',
      fileName
    });
    
  } catch (error: any) {
    console.error('Error deleting file:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to delete file';
      
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}