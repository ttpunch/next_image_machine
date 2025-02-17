import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { FindingStatus, Severity } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    const finding = await prisma.finding.create({
      data: {
        machineId: data.machineId,
        textDescription: data.textDescription,
        status: data.status as FindingStatus,
        severity: data.severity as Severity,
        createdBy: data.createdBy,
      },
      include: {
        machine: true,
        creator: {
          select: {
            username: true,
          },
        },
      },
    });

    return NextResponse.json(finding);
  } catch (error) {
    console.error('Failed to create finding:', error);
    return NextResponse.json(
      { error: 'Failed to create finding' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const machineId = searchParams.get('machineId');

    const findings = await prisma.finding.findMany({
      where: machineId ? {
        machineId: parseInt(machineId),
      } : undefined,
      include: {
        machine: true,
        creator: {
          select: {
            username: true,
          },
        },
        findingTags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdOn: 'desc',
      },
    });

    return NextResponse.json(findings);
  } catch (error) {
    console.error('Failed to fetch findings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch findings' },
      { status: 500 }
    );
  }
}