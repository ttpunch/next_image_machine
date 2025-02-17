import { PrismaClient, UserRole, MachineStatus, FindingStatus, Severity, NotificationType, ReportType, ReportStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Clean up existing data
    console.log('Cleaning existing data...');
    await prisma.$transaction([
      prisma.findingTag.deleteMany(),
      prisma.tag.deleteMany(),
      prisma.comment.deleteMany(),
      prisma.attachment.deleteMany(),
      prisma.finding.deleteMany(),
      prisma.machine.deleteMany(),
      prisma.notification.deleteMany(),
      prisma.report.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    console.log('Creating users...');
    // Create users with hashed passwords
    const adminPassword = await hash('admin123', 10);
    const userPassword = await hash('user123', 10);
    const techPassword = await hash('tech123', 10);

    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        passwordHash: adminPassword,
        role: UserRole.ADMIN,
        active: true,
      },
    });

    const user = await prisma.user.create({
      data: {
        username: 'user',
        passwordHash: userPassword,
        role: UserRole.USER,
        active: true,
      },
    });

    const technician = await prisma.user.create({
      data: {
        username: 'technician',
        passwordHash: techPassword,
        role: UserRole.TECHNICIAN,
        active: true,
      },
    });

    console.log('Creating machines...');
    // Create machines
    const machine1 = await prisma.machine.create({
      data: {
        machineNumber: 'MCH001',
        status: MachineStatus.ACTIVE,
        createdBy: admin.id,
      },
    });

    const machine2 = await prisma.machine.create({
      data: {
        machineNumber: 'MCH002',
        status: MachineStatus.MAINTENANCE,
        createdBy: admin.id,
      },
    });

    const machine3 = await prisma.machine.create({
      data: {
        machineNumber: 'MCH003',
        status: MachineStatus.ACTIVE,
        createdBy: admin.id,
      },
    });

    console.log('Creating tags...');
    // Create tags
    const urgentTag = await prisma.tag.create({
      data: {
        tagName: 'Urgent',
        description: 'Requires immediate attention',
        createdBy: admin.id,
      },
    });

    const maintenanceTag = await prisma.tag.create({
      data: {
        tagName: 'Maintenance',
        description: 'Regular maintenance issue',
        createdBy: admin.id,
      },
    });

    const safetyTag = await prisma.tag.create({
      data: {
        tagName: 'Safety',
        description: 'Safety-related issue',
        createdBy: admin.id,
      },
    });

    console.log('Creating findings...');
    // Create findings
    const finding1 = await prisma.finding.create({
      data: {
        machineId: machine1.id,
        textDescription: 'Unusual noise from the main bearing',
        status: FindingStatus.OPEN,
        severity: Severity.HIGH,
        createdBy: user.id,
      },
    });

    const finding2 = await prisma.finding.create({
      data: {
        machineId: machine2.id,
        textDescription: 'Regular maintenance check required',
        status: FindingStatus.IN_PROGRESS,
        severity: Severity.MEDIUM,
        createdBy: technician.id,
      },
    });

    const finding3 = await prisma.finding.create({
      data: {
        machineId: machine3.id,
        textDescription: 'Emergency stop button needs replacement',
        status: FindingStatus.OPEN,
        severity: Severity.CRITICAL,
        createdBy: user.id,
      },
    });

    console.log('Creating finding tags...');
    // Create finding tags
    await prisma.findingTag.createMany({
      data: [
        { findingId: finding1.id, tagId: urgentTag.id, createdBy: user.id },
        { findingId: finding1.id, tagId: maintenanceTag.id, createdBy: user.id },
        { findingId: finding2.id, tagId: maintenanceTag.id, createdBy: technician.id },
        { findingId: finding3.id, tagId: urgentTag.id, createdBy: user.id },
        { findingId: finding3.id, tagId: safetyTag.id, createdBy: user.id },
      ],
    });

    console.log('Creating comments...');
    // Create comments
    await prisma.comment.createMany({
      data: [
        {
          findingId: finding1.id,
          commentText: 'Scheduled for inspection tomorrow',
          createdBy: technician.id,
        },
        {
          findingId: finding3.id,
          commentText: 'Replacement part ordered',
          createdBy: technician.id,
        },
      ],
    });

    console.log('Creating notifications...');
    // Create notifications
    await prisma.notification.createMany({
      data: [
        {
          userId: technician.id,
          message: 'New critical finding assigned',
          notificationType: NotificationType.ALERT,
        },
        {
          userId: user.id,
          message: 'Your finding has been updated',
          notificationType: NotificationType.INFO,
        },
      ],
    });

    console.log('Creating reports...');
    // Create reports
    await prisma.report.createMany({
      data: [
        {
          reportName: 'Monthly Maintenance Report',
          reportType: ReportType.MONTHLY,
          generatedBy: admin.id,
          status: ReportStatus.COMPLETED,
          parameters: {
            month: 'January',
            year: '2024',
          },
        },
        {
          reportName: 'Safety Audit Report',
          reportType: ReportType.CUSTOM,
          generatedBy: admin.id,
          status: ReportStatus.COMPLETED,
          parameters: {
            startDate: '2024-01-01',
            endDate: '2024-01-31',
          },
        },
      ],
    });

    console.log('Creating attachments...');
    // Create attachments
    await prisma.attachment.createMany({
      data: [
        {
          findingId: finding1.id,
          fileName: 'noise_recording.mp3',
          filePath: '/uploads/noise_recording.mp3',
          fileSize: BigInt(1024576), // 1MB
          fileType: 'audio/mpeg',
          uploadedBy: user.id,
        },
        {
          findingId: finding3.id,
          fileName: 'button_photo.jpg',
          filePath: '/uploads/button_photo.jpg',
          fileSize: BigInt(2048576), // 2MB
          fileType: 'image/jpeg',
          uploadedBy: technician.id,
        },
      ],
    });

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });