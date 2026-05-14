import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getOverview(userId: string): Promise<{
        summary: {
            totalApplications: number;
            savedJobs: number;
            totalJobsAnalyzed: number;
            averageMatchScore: number;
        };
        applicationsByStatus: Record<string, number>;
        scoreDistribution: {
            excellent: number;
            good: number;
            low: number;
        };
        topMatchedJobs: ({
            job: {
                title: string;
                company: string;
                workMode: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            jobId: string;
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
        })[];
        applicationsByMonth: unknown;
    }>;
    getSkillGaps(userId: string): Promise<{
        topMissingSkills: {
            skill: string;
            count: number;
        }[];
        topMatchedSkills: {
            skill: string;
            count: number;
        }[];
        recommendation: string[];
    }>;
}
