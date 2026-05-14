import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Clean data
  await prisma.applicationEvent.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobAnalysis.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.job.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Test User
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'thomas@example.com',
      name: 'Thomas Anderson',
      password: hashedPassword,
      profile: {
        create: {
          headline: 'Senior Fullstack Engineer | NestJS & React Specialist',
          summary: 'Experienced software engineer with 8+ years of building scalable systems.',
          location: 'São Paulo, Brazil',
          yearsExp: 8,
          seniorityLevel: 'senior',
          skills: {
            create: [
              { name: 'TypeScript', level: 'expert', category: 'language' },
              { name: 'NestJS', level: 'advanced', category: 'backend' },
              { name: 'React', level: 'advanced', category: 'frontend' },
              { name: 'PostgreSQL', level: 'advanced', category: 'database' },
              { name: 'Docker', level: 'intermediate', category: 'devops' },
            ],
          },
        },
      },
      resumes: {
        create: {
          title: 'Master Resume 2024',
          isBase: true,
          content: {
            basics: {
              name: 'Thomas Anderson',
              label: 'Senior Fullstack Engineer',
              email: 'thomas@example.com',
              summary: 'Experienced software engineer...',
            },
            work: [
              {
                company: 'Tech Corp',
                position: 'Senior Engineer',
                startDate: '2020-01-01',
                highlights: ['Built a job matching system', 'Scaled API to 1M users'],
              },
            ],
            skills: [
              { name: 'Node.js', keywords: ['NestJS', 'Express'] },
              { name: 'Database', keywords: ['PostgreSQL', 'Redis', 'MongoDB'] },
            ],
          },
          rawText: 'Thomas Anderson - Senior Fullstack Engineer...',
        },
      },
    },
  });

  // 3. Create a Job
  const job = await prisma.job.create({
    data: {
      title: 'Senior Backend Engineer',
      company: 'Global AI Systems',
      location: 'Remote',
      source: 'linkedin',
      sourceUrl: 'https://linkedin.com/jobs/123456',
      description: 'We are looking for a NestJS expert to build our AI backend...',
      requiredSkills: ['Node.js', 'NestJS', 'PostgreSQL', 'Redis'],
      workMode: 'remote',
    },
  });

  // 4. Create an Analysis
  await prisma.jobAnalysis.create({
    data: {
      jobId: job.id,
      userId: user.id,
      overallScore: 85,
      skillScore: 90,
      seniorityScore: 100,
      stackScore: 80,
      matchedSkills: ['Node.js', 'NestJS', 'PostgreSQL'],
      missingSkills: ['Redis'],
      highlights: ['Perfect seniority match', 'Strong NestJS background'],
      gaps: ['Missing production experience with Redis cluster'],
      recommendation: 'apply',
      aiExplanation: 'The candidate is a strong match for this role...',
    },
  });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
