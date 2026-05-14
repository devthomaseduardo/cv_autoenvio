import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreateResumeDto, UpdateResumeDto } from './dto/resumes.dto';

@Injectable()
export class ResumesService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
    @InjectQueue('resume-tailor') private tailorQueue: Queue,
  ) {}

  async create(dto: CreateResumeDto, userId: string) {
    const content = {
      summary: dto.summary,
      experience: dto.experience || [],
      education: dto.education || [],
      skills: dto.skills || [],
      languages: dto.languages || [],
      certifications: dto.certifications || [],
      projects: dto.projects || [],
    };

    // If isBase, unset previous base
    if (dto.isBase) {
      await this.prisma.resume.updateMany({
        where: { userId, isBase: true },
        data: { isBase: false },
      });
    }

    return this.prisma.resume.create({
      data: {
        userId,
        title: dto.title,
        isBase: dto.isBase ?? false,
        content: content as any,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.resume.findMany({
      where: { userId },
      orderBy: [{ isBase: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string, userId: string) {
    const resume = await this.prisma.resume.findUnique({ where: { id } });
    if (!resume) throw new NotFoundException('Resume not found');
    if (resume.userId !== userId) throw new ForbiddenException();
    return resume;
  }

  async update(id: string, dto: UpdateResumeDto, userId: string) {
    await this.findOne(id, userId); // validates ownership
    return this.prisma.resume.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.resume.delete({ where: { id } });
  }

  /**
   * Tailor a resume for a specific job (on-demand, synchronous for testing)
   * In production, this goes through the queue.
   */
  async tailorForJob(resumeId: string, jobId: string, userId: string) {
    const [resume, job] = await Promise.all([
      this.findOne(resumeId, userId),
      this.prisma.job.findUnique({ where: { id: jobId } }),
    ]);

    if (!job) throw new NotFoundException('Job not found');

    const tailored = await this.ai.tailorResume(
      resume.content,
      job.description,
      job.title,
      job.company,
    );

    // Save as a new tailored version
    const tailoredResume = await this.prisma.resume.create({
      data: {
        userId,
        title: `${resume.title} → ${job.company} (${job.title})`,
        isBase: false,
        content: tailored.tailoredContent as any,
        version: (resume.version || 1) + 1,
      },
    });

    return {
      resume: tailoredResume,
      coverLetter: tailored.coverLetter,
      technicalBrief: tailored.technicalBrief,
      keyChanges: tailored.keyChanges,
    };
  }

  async getBaseResume(userId: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { userId, isBase: true },
    });

    if (!resume) throw new NotFoundException('No base resume found. Please create one first.');
    return resume;
  }
}
