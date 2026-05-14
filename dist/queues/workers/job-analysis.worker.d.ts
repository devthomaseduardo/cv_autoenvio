import { Job as BullJob } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
interface AnalyzeMatchPayload {
    jobId: string;
    userId: string;
    analysisId: string;
}
export declare class JobAnalysisWorker {
    private prisma;
    private ai;
    private readonly logger;
    constructor(prisma: PrismaService, ai: AiService);
    onActive(job: BullJob): void;
    onCompleted(job: BullJob): void;
    onFailed(job: BullJob, error: Error): void;
    handleAnalyzeMatch(bullJob: BullJob<AnalyzeMatchPayload>): Promise<{
        success: boolean;
    }>;
}
export {};
