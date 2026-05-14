import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { ScrapingService } from '../scraping/scraping.service';
import { AiService } from '../ai/ai.service';
import { SubmitJobUrlDto, CreateJobManuallyDto, JobQueryDto } from './dto/jobs.dto';
export declare class JobsService {
    private prisma;
    private scraping;
    private ai;
    private analysisQueue;
    private readonly logger;
    constructor(prisma: PrismaService, scraping: ScrapingService, ai: AiService, analysisQueue: Queue);
    submitJobUrl(dto: SubmitJobUrlDto, userId: string): Promise<{
        job: {
            id: string;
            sourceUrl: string;
            externalId: string | null;
            source: string;
            title: string;
            company: string;
            location: string | null;
            workMode: string | null;
            contractType: string | null;
            salaryMin: number | null;
            salaryMax: number | null;
            description: string;
            requirements: string | null;
            benefits: string | null;
            requiredSkills: string[];
            niceToHave: string[];
            seniority: string | null;
            postedAt: Date | null;
            expiresAt: Date | null;
            isActive: boolean;
            scrapedAt: Date;
            createdAt: Date;
        };
        analysisId: string;
        message: string;
        analysisStatus: string;
    }>;
    createManual(dto: CreateJobManuallyDto, userId: string): Promise<{
        job: {
            id: string;
            sourceUrl: string;
            externalId: string | null;
            source: string;
            title: string;
            company: string;
            location: string | null;
            workMode: string | null;
            contractType: string | null;
            salaryMin: number | null;
            salaryMax: number | null;
            description: string;
            requirements: string | null;
            benefits: string | null;
            requiredSkills: string[];
            niceToHave: string[];
            seniority: string | null;
            postedAt: Date | null;
            expiresAt: Date | null;
            isActive: boolean;
            scrapedAt: Date;
            createdAt: Date;
        };
        analysisId: string;
        message: string;
        analysisStatus: string;
    }>;
    getJobWithAnalysis(jobId: string, userId: string): Promise<{
        analyses: {
            id: string;
            createdAt: Date;
            userId: string;
            overallScore: number;
            skillScore: number;
            seniorityScore: number;
            cultureScore: number | null;
            stackScore: number;
            matchedSkills: string[];
            missingSkills: string[];
            highlights: string[];
            gaps: string[];
            recommendation: string;
            aiExplanation: string;
            jobId: string;
        }[];
    } & {
        id: string;
        sourceUrl: string;
        externalId: string | null;
        source: string;
        title: string;
        company: string;
        location: string | null;
        workMode: string | null;
        contractType: string | null;
        salaryMin: number | null;
        salaryMax: number | null;
        description: string;
        requirements: string | null;
        benefits: string | null;
        requiredSkills: string[];
        niceToHave: string[];
        seniority: string | null;
        postedAt: Date | null;
        expiresAt: Date | null;
        isActive: boolean;
        scrapedAt: Date;
        createdAt: Date;
    }>;
    listJobs(query: JobQueryDto, userId: string): Promise<{
        data: ({
            analyses: {
                overallScore: number;
                recommendation: string;
            }[];
        } & {
            id: string;
            sourceUrl: string;
            externalId: string | null;
            source: string;
            title: string;
            company: string;
            location: string | null;
            workMode: string | null;
            contractType: string | null;
            salaryMin: number | null;
            salaryMax: number | null;
            description: string;
            requirements: string | null;
            benefits: string | null;
            requiredSkills: string[];
            niceToHave: string[];
            seniority: string | null;
            postedAt: Date | null;
            expiresAt: Date | null;
            isActive: boolean;
            scrapedAt: Date;
            createdAt: Date;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    toggleSaveJob(jobId: string, userId: string): Promise<{
        saved: boolean;
    }>;
    getAnalysis(jobId: string, userId: string): Promise<{
        status: any;
        data: {
            id: string;
            createdAt: Date;
            userId: string;
            overallScore: number;
            skillScore: number;
            seniorityScore: number;
            cultureScore: number | null;
            stackScore: number;
            matchedSkills: string[];
            missingSkills: string[];
            highlights: string[];
            gaps: string[];
            recommendation: string;
            aiExplanation: string;
            jobId: string;
        };
        message: string;
    }>;
}
