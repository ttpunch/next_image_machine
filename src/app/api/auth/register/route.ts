import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import bcrypt from 'bcryptjs';

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN' | 'TECHNICIAN';  // Updated to match enum
  active?: boolean;
}

export async function POST(request: Request) {
  try {
    // Log request headers
    console.log('Request headers:', Object.fromEntries(request.headers));

    // Read and parse the request body once
    const rawBody = await request.text();
    console.log('Raw request body:', rawBody);

    // Parse the raw body into JSON
    let data: RegisterRequest;
    try {
      data = JSON.parse(rawBody);
    } catch (error) {
      console.log('Failed to parse request body:', error instanceof Error ? error.message : 'Unknown parsing error');
      return NextResponse.json(
        { message: 'Invalid request body format' },
        { status: 400 }
      );
    }

    console.log('Parsed request data:', data);

    // Validate required fields
    if (!data.username || !data.email || !data.password) {
      return NextResponse.json(
        { message: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate username length
    if (data.username.length < 3 || data.username.length > 50) {
      return NextResponse.json(
        { message: 'Username must be between 3 and 50 characters' },
        { status: 400 }
      );
    }

    // Validate password length
    if (data.password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Validate role if provided
    if (data.role && !['USER', 'ADMIN', 'TECHNICIAN'].includes(data.role)) {
      return NextResponse.json(
        { message: 'Invalid role. Must be USER, ADMIN, or TECHNICIAN' },
        { status: 400 }
      );
    }

    // Check for existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: data.username },
        ],
      },
    });

    if (existingUser) {
      const field = existingUser.email === data.email ? 'email' : 'username';
      return NextResponse.json(
        { message: `${field} already exists` },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create new user with proper enum value
    const newUser = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        role: (data.role || 'USER') as 'USER' | 'ADMIN' | 'TECHNICIAN',
        active: data.active !== undefined ? data.active : true
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        active: true,
        createdAt: true
      }
    });

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: newUser 
      }, 
      { status: 201 }
    );

  } catch (error) {
    // Safely handle and log the error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.log('Registration error:', errorMessage);

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Internal server error',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}