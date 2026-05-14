import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { ScrapingService } from '../scraping/scraping.service';
import { AiService } from '../ai/ai.service';
import { SubmitJobUrlDto, CreateJobManuallyDto, JobQueryDto } from './dto/jobs.dto';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private prisma: PrismaService,
    private scraping: ScrapingService,
    private ai: AiService,
    @InjectQueue('job-analysis') private analysisQueue: Queue,
  ) {}

  // ── Submit job URL ─────────────────────────────────────────────────────
  /**
   * This is the MAIN entry point of the system.
   * User pastes a URL → we scrape → enqueue AI analysis → return immediately.
   *
   * This is the "controller → service → queue → worker → AI provider" pattern.
   * We do NOT block the HTTP request waiting for AI.
   */
  async submitJobUrl(dto: SubmitJobUrlDto, userId: string) {
    this.logger.log(`Submitting job URL: ${dto.url} for user: ${userId}`);

    // 1. Scrape job data immediately (fast, ~2-5s)
    const scraped = await this.scraping.scrapeJobUrl(dto.url);

    // 2. Upsert job in database
    const job = await this.prisma.job.upsert({
      where: { sourceUrl: dto.url },
      update: { scrapedAt: new Date() },
      create: {
        sourceUrl: dto.url,
        source: scraped.source,
        title: scraped.title,
        company: scraped.company,
        location: scraped.location,
        workMode: scraped.workMode,
        description: scraped.description,
        requirements: scraped.requirements,
        requiredSkills: scraped.skills,
        seniority: scraped.seniority,
        postedAt: scraped.postedAt,
      },
    });

    // 3. Create a PENDING analysis record (so frontend can track it)
    const analysis = await this.prisma.jobAnalysis.create({
      data: {
        jobId: job.id,
        userId,
        status: 'PENDING',
      },
    });
    this.logger.log(`Created PENDING analysis: ${analysis.id}`);

    // 4. Enqueue AI analysis (async, non-blocking)
    await this.analysisQueue.add(
      'analyze-match',
      { jobId: job.id, userId, analysisId: analysis.id },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        priority: 1,
      },
    );

    return {
      job,
      analysisId: analysis.id,
      message: 'Job submitted for AI analysis. Check back in a few seconds.',
      analysisStatus: 'PENDING',
    };
  }

  // ── Create manually ────────────────────────────────────────────────────
  async createManual(dto: CreateJobManuallyDto, userId: string) {
    this.logger.log(`Creating manual job: ${dto.title} for user: ${userId}`);

    const job = await this.prisma.job.create({
      data: {
        sourceUrl: dto.sourceUrl || `manual-${Date.now()}`,
        source: 'manual',
        title: dto.title,
        company: dto.company,
        description: dto.description,
        location: dto.location,
        workMode: dto.workMode,
      },
    });

    // Create a PENDING analysis record
    const analysis = await this.prisma.jobAnalysis.create({
      data: {
        jobId: job.id,
        userId,
        status: 'PENDING',
      },
    });

    await this.analysisQueue.add(
      'analyze-match',
      { jobId: job.id, userId, analysisId: analysis.id },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
      },
    );

    return {
      job,
      analysisId: analysis.id,
      message: 'Job created and analysis queued.',
      analysisStatus: 'PENDING',
    };
  }

  // ── Get job with analysis ──────────────────────────────────────────────
  async getJobWithAnalysis(jobId: string, userId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        analyses: {
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!job) throw new NotFoundException(`Job not found: ${jobId}`);
    return job;
  }

  // ── List jobs ──────────────────────────────────────────────────────────
  async listJobs(query: JobQueryDto, userId: string) {
    const { search, workMode, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };
    if (workMode) where.workMode = workMode;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          analyses: {
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { overallScore: true, recommendation: true },
          },
        },
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data: jobs,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  // ── Save / unsave job ──────────────────────────────────────────────────
  async toggleSaveJob(jobId: string, userId: string) {
    const existing = await this.prisma.savedJob.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });

    if (existing) {
      await this.prisma.savedJob.delete({ where: { id: existing.id } });
      return { saved: false };
    }

    await this.prisma.savedJob.create({ data: { userId, jobId } });
    return { saved: true };
  }

  // ── Get analysis result ────────────────────────────────────────────────
  async getAnalysis(jobId: string, userId: string) {
    const analysis = await this.prisma.jobAnalysis.findFirst({
      where: { jobId, userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!analysis) {
      throw new NotFoundException(`No analysis found for job: ${jobId}`);
    }

    return {
      status: analysis.status,
      data: analysis.status === 'COMPLETED' ? analysis : null,
      message: analysis.status === 'COMPLETED' 
        ? 'Analysis complete' 
        : analysis.status === 'FAILED'
        ? 'Analysis failed. Please try again.'
        : 'Analysis in progress...',
    };
  }
}
