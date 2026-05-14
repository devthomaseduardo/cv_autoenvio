import { JobsService } from './jobs.service';
import { SubmitJobUrlDto, CreateJobManuallyDto, JobQueryDto } from './dto/jobs.dto';
export declare class JobsController {
    private readonly jobsService;
    constructor(jobsService: JobsService);
    submitJobUrl(dto: SubmitJobUrlDto, user: {
        id: string;
    }): Promise<{
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
    createManual(dto: CreateJobManuallyDto, user: {
        id: string;
    }): Promise<{
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
    listJobs(query: JobQueryDto, user: {
        id: string;
    }): Promise<{
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
    getJob(id: string, user: {
        id: string;
    }): Promise<{
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
    getAnalysis(id: string, user: {
        id: string;
    }): Promise<{
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
    toggleSave(id: string, user: {
        id: string;
    }): Promise<{
        saved: boolean;
    }>;
}
