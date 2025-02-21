"use server"

import { prisma } from './lib/db';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';

interface CreateRecordInput {
  machineNumber: string;
  description: string;
  tags: string;
  imageUrl?: string;
  userId: string;
}

export async function createRecord(data: CreateRecordInput) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    // Validate input data
    if (!data || !data.machineNumber || !data.description) {
      return { success: false, error: 'Invalid input data' };
    }

    const machine = await prisma.machine.upsert({
      where: { number: data.machineNumber },
      update: {},
      create: {
        number: data.machineNumber,
        name: `Machine ${data.machineNumber}`,
      },
    });

    const tagNames = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

    const record = await prisma.record.create({
      data: {
        machineId: machine.id,
        description: data.description,
        imageUrl: data.imageUrl || '',
        createdBy: session.user.id,
        tags: {
          create: tagNames.map(tagName => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName }
              }
            }
          }))
        }
      },
      include: {
        machine: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    return { success: true, data: record };

  } catch (error) {
    console.error('Error creating record:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create record'
    };
  }
}

export async function fetchRecords() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    const records = await prisma.record.findMany({
      where: {
        createdBy: session.user.id
      },
      include: {
        machine: true,
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return { 
      success: true, 
      data: records.map(record => ({
        id: record.id,
        machineNumber: record.machine.number,
        imageUrl: record.imageUrl,
        description: record.description,
        tags: record.tags.map(tag => ({
          recordId: tag.recordId,
          tagId: tag.tagId,
          tag: {
            name: tag.tag.name
          }
        })),
        createdOn: record.createdAt.toISOString()
      }))
    };

  } catch (error) {
    console.error('Error fetching records:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch records'
    };
  }
}

export async function getRecordById(recordId: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    const record = await prisma.record.findUnique({
      where: {
        id: recordId,
        createdBy: session.user.id
      },
      include: {
        machine: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (!record) {
      return { success: false, error: 'Record not found' };
    }

    return { 
      success: true, 
      data: {
        id: record.id,
        machineNumber: record.machine.number,
        imageUrl: record.imageUrl,
        description: record.description,
        tags: record.tags.map(tag => ({
          recordId: tag.recordId,
          tagId: tag.tagId,
          tag: {
            name: tag.tag.name
          }
        })),
        createdOn: record.createdAt.toISOString()
      }
    };

  } catch (error) {
    console.error('Error fetching record:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch record'
    };
  }
}

export async function updateRecord(recordId: string, data: {
  machineNumber: string;
  description: string;
  tags: string;
  imageUrl?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    const machine = await prisma.machine.upsert({
      where: { number: data.machineNumber },
      update: {},
      create: {
        number: data.machineNumber,
        name: `Machine ${data.machineNumber}`,
      },
    });

    const tagNames = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

    // Delete existing tags
    await prisma.recordTag.deleteMany({
      where: { recordId }
    });

    // Update record with new data
    const updatedRecord = await prisma.record.update({
      where: { id: recordId },
      data: {
        machineId: machine.id,
        description: data.description,
        imageUrl: data.imageUrl,
        tags: {
          create: tagNames.map(tagName => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName }
              }
            }
          }))
        }
      },
      include: {
        machine: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    return { success: true, data: updatedRecord };
  } catch (error) {
    console.error('Error updating record:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update record'
    };
  }
}

export async function deleteRecord(recordId: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    await prisma.recordTag.deleteMany({
      where: { recordId }
    });

    await prisma.record.delete({
      where: { 
        id: recordId,
        createdBy: session.user.id
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting record:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete record'
    };
  }
}