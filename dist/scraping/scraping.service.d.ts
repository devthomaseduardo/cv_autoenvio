import { ConfigService } from '@nestjs/config';
export interface ScrapedJob {
    title: string;
    company: string;
    location?: string;
    workMode?: string;
    description: string;
    requirements?: string;
    skills: string[];
    seniority?: string;
    source: string;
    postedAt?: Date;
    externalId?: string;
}
export declare class ScrapingService {
    private config;
    private readonly logger;
    private readonly timeout;
    constructor(config: ConfigService);
    scrapeJobUrl(url: string): Promise<ScrapedJob>;
    private detectSource;
    private scrapeLinkedIn;
    private scrapeGupy;
    private scrapeIndeed;
    private scrapeGeneric;
    private fallbackScrape;
    private extractSkillsFromText;
    private detectWorkMode;
    private normalizeWorkMode;
}
