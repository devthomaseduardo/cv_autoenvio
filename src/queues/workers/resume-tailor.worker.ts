import { Processor, Process, OnQueueFailed } from '@nestjs/bull';
import { Job as BullJob } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';

interface TailorResumePayload {
  applicationId: string;
  jobId: string;
  userId: string;
  resumeId: string;
}

/**
 * RESUME TAILOR WORKER
 *
 * Triggered when user creates an application.
 * Reads base resume → calls AI to tailor → saves tailored version.
 */
@Processor('resume-tailor')
export class ResumeTailorWorker {
  private readonly logger = new Logger(ResumeTailorWorker.name);

  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) {}

  @OnQueueFailed()
  onFailed(job: BullJob, error: Error) {
    this.logger.error(`❌ Resume tailor failed for job ${job.id}: ${error.message}`);
  }

  @Process('tailor-resume')
  async handleTailorResume(bullJob: BullJob<TailorResumePayload>) {
    const { applicationId, jobId, userId, resumeId } = bullJob.data;

    this.logger.log(`✏️ Tailoring resume for application: ${applicationId}`);

    // Load everything in parallel
    const [application, job, resume, userProfile] = await Promise.all([
      this.prisma.application.findUnique({ where: { id: applicationId } }),
      this.prisma.job.findUnique({ where: { id: jobId } }),
      this.prisma.resume.findUnique({ where: { id: resumeId } }),
      this.prisma.userProfile.findUnique({
        where: { userId },
        include: { skills: true, user: true },
      }),
    ]);

    if (!job || !resume || !userProfile) {
      throw new Error('Missing data for resume tailoring');
    }

    // Run AI tailoring
    const tailored = await this.ai.tailorResume(
      resume.content,
      job.description,
      job.title,
      job.company,
    );

    // Generate cover letter if not already exists
    const coverLetter = tailored.coverLetter || await this.ai.generateCoverLetter(
      job.title,
      job.company,
      job.description,
      userProfile.user,
      userProfile.summary || '',
    );

    await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        tailoredResume: tailored.tailoredContent as any,
        coverLetter,
        technicalBrief: tailored.technicalBrief,
        status: 'READY',
      },
    });

    // Save event
    await this.prisma.applicationEvent.create({
      data: {
        applicationId,
        type: 'tailored',
        description: `Resume tailored with ${tailored.keyChanges?.length || 0} optimizations`,
      },
    });

    this.logger.log(`✅ Resume tailored successfully for application: ${applicationId}`);
    return { success: true };
  }
}
