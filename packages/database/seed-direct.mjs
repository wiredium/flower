import pkg from '@prisma/client';
import bcrypt from 'bcryptjs';

const { PrismaClient } = pkg;

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function main() {
  console.log('🌱 Starting seed...');

  try {
    // Test connection
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected');

    // Clean existing data
    console.log('Cleaning existing data...');
    await prisma.workflowExecution.deleteMany();
    await prisma.aIGeneration.deleteMany();
    await prisma.projectCollaborator.deleteMany();
    await prisma.project.deleteMany();
    await prisma.template.deleteMany();
    await prisma.user.deleteMany();

    // Create users
    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('demo123456', 10);
    
    const alice = await prisma.user.create({
      data: {
        email: 'alice@example.com',
        name: 'Alice Johnson',
        hashedPassword,
        role: 'ADMIN',
        credits: 5000,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'
      }
    });

    const bob = await prisma.user.create({
      data: {
        email: 'bob@example.com',
        name: 'Bob Smith',
        hashedPassword,
        role: 'USER',
        credits: 1000,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'
      }
    });

    const charlie = await prisma.user.create({
      data: {
        email: 'charlie@example.com',
        name: 'Charlie Brown',
        hashedPassword,
        role: 'USER',
        credits: 500,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie'
      }
    });

    // Create a simple project for each user
    console.log('Creating projects...');
    await prisma.project.create({
      data: {
        name: 'AI Customer Assistant',
        description: 'An intelligent chatbot that handles customer inquiries',
        ownerId: alice.id,
        visibility: 'PUBLIC',
        status: 'ACTIVE',
        tags: ['ai', 'chatbot', 'customer-service'],
        workflowData: {
          nodes: [],
          edges: []
        }
      }
    });

    await prisma.project.create({
      data: {
        name: 'Content Generation Suite',
        description: 'Multi-model content generation system',
        ownerId: bob.id,
        visibility: 'PUBLIC',
        status: 'ACTIVE',
        tags: ['content', 'marketing', 'ai-writing'],
        workflowData: {
          nodes: [],
          edges: []
        }
      }
    });

    await prisma.project.create({
      data: {
        name: 'AI Code Reviewer',
        description: 'Automated code review system',
        ownerId: charlie.id,
        visibility: 'PUBLIC',
        status: 'ACTIVE',
        tags: ['code-review', 'development'],
        workflowData: {
          nodes: [],
          edges: []
        }
      }
    });

    // Create a template
    console.log('Creating templates...');
    await prisma.template.create({
      data: {
        name: 'Customer Service Chatbot',
        description: 'Ready-to-use chatbot template',
        category: 'CHATBOT',
        authorId: alice.id,
        isPublic: true,
        tags: ['chatbot', 'template'],
        workflowData: { nodes: [], edges: [] },
        prefillData: {},
        icon: 'https://via.placeholder.com/600x400'
      }
    });

    console.log('✅ Seed completed successfully!');
    console.log('📧 Test accounts:');
    console.log('   - alice@example.com (Admin)');
    console.log('   - bob@example.com (User)');
    console.log('   - charlie@example.com (User)');
    console.log('   Password for all: demo123456');
    console.log('');
    console.log('📊 Created:');
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    const templateCount = await prisma.template.count();
    console.log(`   - ${userCount} users`);
    console.log(`   - ${projectCount} projects`);
    console.log(`   - ${templateCount} templates`);
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });