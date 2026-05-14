import { Job as BullJob } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
interface TailorResumePayload {
    applicationId: string;
    jobId: string;
    userId: string;
    resumeId: string;
}
export declare class ResumeTailorWorker {
    private prisma;
    private ai;
    private readonly logger;
    constructor(prisma: PrismaService, ai: AiService);
    onFailed(job: BullJob, error: Error): void;
    handleTailorResume(bullJob: BullJob<TailorResumePayload>): Promise<{
        success: boolean;
    }>;
}
export {};
