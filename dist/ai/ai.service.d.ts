import { ConfigService } from '@nestjs/config';
export interface JobAnalysisResult {
    overallScore: number;
    skillScore: number;
    seniorityScore: number;
    stackScore: number;
    cultureScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    highlights: string[];
    gaps: string[];
    recommendation: 'apply' | 'consider' | 'skip';
    aiExplanation: string;
}
export interface TailoredResumeResult {
    tailoredContent: any;
    coverLetter: string;
    technicalBrief: string;
    keyChanges: string[];
}
export declare class AiService {
    private config;
    private readonly logger;
    private openai;
    private model;
    constructor(config: ConfigService);
    analyzeJobMatch(jobDescription: string, userProfile: {
        skills: Array<{
            name: string;
            level: string;
            yearsExp?: number;
        }>;
        yearsExp: number;
        headline: string;
        summary: string;
        seniorityLevel: string;
    }): Promise<JobAnalysisResult>;
    tailorResume(baseResume: any, jobDescription: string, jobTitle: string, company: string): Promise<TailoredResumeResult>;
    extractJobSkills(description: string): Promise<{
        required: string[];
        niceToHave: string[];
        seniority: string;
    }>;
    generateCoverLetter(jobTitle: string, company: string, jobDescription: string, userProfile: any, resumeSummary: string): Promise<string>;
}
