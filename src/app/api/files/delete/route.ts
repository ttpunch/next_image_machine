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
    return NextResponse.json(
      { message: `Error deleting file: ${error.message}` },
      { status: 500 }
    );
  }
}