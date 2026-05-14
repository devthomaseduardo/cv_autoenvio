import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getOverview(user: {
        id: string;
    }): Promise<{
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
    getSkillGaps(user: {
        id: string;
    }): Promise<{
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
