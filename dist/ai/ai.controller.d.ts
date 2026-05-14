import { AiService } from './ai.service';
declare class AnalyzeDto {
    jobDescription: string;
}
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    extractSkills(dto: AnalyzeDto): Promise<{
        required: string[];
        niceToHave: string[];
        seniority: string;
    }>;
}
export {};
