import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Job as BullJob } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';

interface AnalyzeMatchPayload {
  jobId: string;
  userId: string;
  analysisId: string;
}

/**
 * JOB ANALYSIS WORKER
 *
 * This is the "worker" in our architecture:
 * controller → service → queue → [THIS WORKER] → AI provider → database
 */
@Processor('job-analysis')
export class JobAnalysisWorker {
  private readonly logger = new Logger(JobAnalysisWorker.name);

  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) {}

  @OnQueueActive()
  onActive(job: BullJob) {
    this.logger.log(`🔄 Processing job #${job.id}: ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: BullJob) {
    this.logger.log(`✅ Completed job #${job.id}: ${job.name}`);
  }

  @OnQueueFailed()
  onFailed(job: BullJob, error: Error) {
    this.logger.error(`❌ Failed job #${job.id}: ${error.message}`);
  }

  @Process('analyze-match')
  async handleAnalyzeMatch(bullJob: BullJob<AnalyzeMatchPayload>) {
    const { jobId, userId, analysisId } = bullJob.data;

    this.logger.log(`🤖 Analyzing match: analysis=${analysisId}, job=${jobId}, user=${userId}`);

    try {
      // 1. Update status to PROCESSING
      await this.prisma.jobAnalysis.update({
        where: { id: analysisId },
        data: { status: 'PROCESSING' },
      });

      // 2. Load job and user data
      const [job, userProfile] = await Promise.all([
        this.prisma.job.findUnique({ where: { id: jobId } }),
        this.prisma.userProfile.findUnique({
          where: { userId },
          include: { skills: true },
        }),
      ]);

      if (!job || !userProfile) {
        throw new Error(`Missing job or profile data`);
      }

      // 3. Run AI analysis
      const analysis = await this.ai.analyzeJobMatch(job.description, {
        skills: userProfile.skills.map((s) => ({
          name: s.name,
          level: s.level,
          yearsExp: s.yearsExp,
        })),
        yearsExp: userProfile.yearsExp || 0,
        headline: userProfile.headline || '',
        summary: userProfile.summary || '',
        seniorityLevel: userProfile.seniorityLevel || 'mid',
      });

      // 4. Save analysis results and set status to COMPLETED
      await this.prisma.jobAnalysis.update({
        where: { id: analysisId },
        data: {
          status: 'COMPLETED',
          overallScore: analysis.overallScore,
          skillScore: analysis.skillScore,
          seniorityScore: analysis.seniorityScore,
          stackScore: analysis.stackScore,
          cultureScore: analysis.cultureScore,
          matchedSkills: analysis.matchedSkills as any,
          missingSkills: analysis.missingSkills as any,
          highlights: analysis.highlights as any,
          gaps: analysis.gaps as any,
          recommendation: analysis.recommendation,
          aiExplanation: analysis.aiExplanation as any,
        },
      });

      // 5. Update job's extracted skills if empty
      if (job.requiredSkills.length === 0 && analysis.matchedSkills.length > 0) {
        await this.prisma.job.update({
          where: { id: jobId },
          data: { requiredSkills: [...analysis.matchedSkills, ...analysis.missingSkills] },
        });
      }

      this.logger.log(`✅ Analysis completed for ${analysisId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to analyze job: ${error.message}`);
      await this.prisma.jobAnalysis.update({
        where: { id: analysisId },
        data: { status: 'FAILED' },
      }).catch(() => {}); // ignore error if db update fails
      throw error;
    }
  }
}
