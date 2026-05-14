"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var JobsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../prisma/prisma.service");
const scraping_service_1 = require("../scraping/scraping.service");
const ai_service_1 = require("../ai/ai.service");
let JobsService = JobsService_1 = class JobsService {
    constructor(prisma, scraping, ai, analysisQueue) {
        this.prisma = prisma;
        this.scraping = scraping;
        this.ai = ai;
        this.analysisQueue = analysisQueue;
        this.logger = new common_1.Logger(JobsService_1.name);
    }
    async submitJobUrl(dto, userId) {
        this.logger.log(`Submitting job URL: ${dto.url} for user: ${userId}`);
        const scraped = await this.scraping.scrapeJobUrl(dto.url);
        const job = await this.prisma.job.upsert({
            where: { sourceUrl: dto.url },
            update: { scrapedAt: new Date() },
            create: {
                sourceUrl: dto.url,
                source: scraped.source,
                title: scraped.title,
                company: scraped.company,
                location: scraped.location,
                workMode: scraped.workMode,
                description: scraped.description,
                requirements: scraped.requirements,
                requiredSkills: scraped.skills,
                seniority: scraped.seniority,
                postedAt: scraped.postedAt,
            },
        });
        const analysis = await this.prisma.jobAnalysis.create({
            data: {
                jobId: job.id,
                userId,
                status: 'PENDING',
            },
        });
        this.logger.log(`Created PENDING analysis: ${analysis.id}`);
        await this.analysisQueue.add('analyze-match', { jobId: job.id, userId, analysisId: analysis.id }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 3000 },
            priority: 1,
        });
        return {
            job,
            analysisId: analysis.id,
            message: 'Job submitted for AI analysis. Check back in a few seconds.',
            analysisStatus: 'PENDING',
        };
    }
    async createManual(dto, userId) {
        this.logger.log(`Creating manual job: ${dto.title} for user: ${userId}`);
        const job = await this.prisma.job.create({
            data: {
                sourceUrl: dto.sourceUrl || `manual-${Date.now()}`,
                source: 'manual',
                title: dto.title,
                company: dto.company,
                description: dto.description,
                location: dto.location,
                workMode: dto.workMode,
            },
        });
        const analysis = await this.prisma.jobAnalysis.create({
            data: {
                jobId: job.id,
                userId,
                status: 'PENDING',
            },
        });
        await this.analysisQueue.add('analyze-match', { jobId: job.id, userId, analysisId: analysis.id }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 3000 },
        });
        return {
            job,
            analysisId: analysis.id,
            message: 'Job created and analysis queued.',
            analysisStatus: 'PENDING',
        };
    }
    async getJobWithAnalysis(jobId, userId) {
        const job = await this.prisma.job.findUnique({
            where: { id: jobId },
            include: {
                analyses: {
                    where: { userId },
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        });
        if (!job)
            throw new common_1.NotFoundException(`Job not found: ${jobId}`);
        return job;
    }
    async listJobs(query, userId) {
        const { search, workMode, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;
        const where = { isActive: true };
        if (workMode)
            where.workMode = workMode;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { company: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [jobs, total] = await Promise.all([
            this.prisma.job.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    analyses: {
                        where: { userId },
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                        select: { overallScore: true, recommendation: true },
                    },
                },
            }),
            this.prisma.job.count({ where }),
        ]);
        return {
            data: jobs,
            meta: { total, page, limit, pages: Math.ceil(total / limit) },
        };
    }
    async toggleSaveJob(jobId, userId) {
        const existing = await this.prisma.savedJob.findUnique({
            where: { userId_jobId: { userId, jobId } },
        });
        if (existing) {
            await this.prisma.savedJob.delete({ where: { id: existing.id } });
            return { saved: false };
        }
        await this.prisma.savedJob.create({ data: { userId, jobId } });
        return { saved: true };
    }
    async getAnalysis(jobId, userId) {
        const analysis = await this.prisma.jobAnalysis.findFirst({
            where: { jobId, userId },
            orderBy: { createdAt: 'desc' },
        });
        if (!analysis) {
            throw new common_1.NotFoundException(`No analysis found for job: ${jobId}`);
        }
        return {
            status: analysis.status,
            data: analysis.status === 'COMPLETED' ? analysis : null,
            message: analysis.status === 'COMPLETED'
                ? 'Analysis complete'
                : analysis.status === 'FAILED'
                    ? 'Analysis failed. Please try again.'
                    : 'Analysis in progress...',
        };
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = JobsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, bull_1.InjectQueue)('job-analysis')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        scraping_service_1.ScrapingService,
        ai_service_1.AiService, Object])
], JobsService);
//# sourceMappingURL=jobs.service.js.map