import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { ResumesService } from '../resumes/resumes.service';

export class CreateApplicationDto {
  jobId: string;
  resumeId?: string;
  notes?: string;
}

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private resumes: ResumesService,
    @InjectQueue('resume-tailor') private tailorQueue: Queue,
  ) {}

  async create(dto: CreateApplicationDto, userId: string) {
    // Get base resume if not specified
    let resumeId = dto.resumeId;
    if (!resumeId) {
      const base = await this.resumes.getBaseResume(userId).catch(() => null);
      resumeId = base?.id;
    }

    const application = await this.prisma.application.create({
      data: {
        userId,
        jobId: dto.jobId,
        resumeId,
        notes: dto.notes,
        status: 'PENDING',
      },
    });

    // Enqueue resume tailoring (async)
    if (resumeId) {
      await this.tailorQueue.add('tailor-resume', {
        applicationId: application.id,
        jobId: dto.jobId,
        userId,
        resumeId,
      });
    }

    return {
      application,
      message: 'Application created. AI is tailoring your resume...',
    };
  }

  async findAll(userId: string) {
    return this.prisma.application.findMany({
      where: { userId },
      include: {
        job: { select: { title: true, company: true, location: true, workMode: true } },
        resume: { select: { title: true } },
        events: { orderBy: { occurredAt: 'desc' }, take: 5 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.application.findFirst({
      where: { id, userId },
      include: {
        job: true,
        resume: true,
        events: { orderBy: { occurredAt: 'desc' } },
      },
    });
  }

  async updateStatus(id: string, status: string, userId: string) {
    const application = await this.prisma.application.update({
      where: { id },
      data: { status: status as any },
    });

    await this.prisma.applicationEvent.create({
      data: {
        applicationId: id,
        type: status.toLowerCase(),
        description: `Status updated to ${status}`,
      },
    });

    return application;
  }

  async getStats(userId: string) {
    const [total, byStatus, averageScore] = await Promise.all([
      this.prisma.application.count({ where: { userId } }),
      this.prisma.application.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      }),
      this.prisma.jobAnalysis.aggregate({
        where: { userId },
        _avg: { overallScore: true },
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      averageMatchScore: Math.round(averageScore._avg.overallScore || 0),
    };
  }
}
