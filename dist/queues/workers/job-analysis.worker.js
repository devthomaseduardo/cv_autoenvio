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
var JobAnalysisWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobAnalysisWorker = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ai_service_1 = require("../../ai/ai.service");
let JobAnalysisWorker = JobAnalysisWorker_1 = class JobAnalysisWorker {
    constructor(prisma, ai) {
        this.prisma = prisma;
        this.ai = ai;
        this.logger = new common_1.Logger(JobAnalysisWorker_1.name);
    }
    onActive(job) {
        this.logger.log(`🔄 Processing job #${job.id}: ${job.name}`);
    }
    onCompleted(job) {
        this.logger.log(`✅ Completed job #${job.id}: ${job.name}`);
    }
    onFailed(job, error) {
        this.logger.error(`❌ Failed job #${job.id}: ${error.message}`);
    }
    async handleAnalyzeMatch(bullJob) {
        const { jobId, userId, analysisId } = bullJob.data;
        this.logger.log(`🤖 Analyzing match: analysis=${analysisId}, job=${jobId}, user=${userId}`);
        try {
            await this.prisma.jobAnalysis.update({
                where: { id: analysisId },
                data: { status: 'PROCESSING' },
            });
            const [job, userProfile] = await Promise.all([
                this.prisma.job.findUnique({ where: { id: jobId } }),
                this.prisma.userProfile.findUnique({
                    where: { userId },
                    include: { skills: true },
                }),
            ]);
            if (!job || !userProfile) {
                throw new Error(`Missing job or profile data`);
            }
            const analysis = await this.ai.analyzeJobMatch(job.description, {
                skills: userProfile.skills.map((s) => ({
                    name: s.name,
                    level: s.level,
                    yearsExp: s.yearsExp,
                })),
                yearsExp: userProfile.yearsExp || 0,
                headline: userProfile.headline || '',
                summary: userProfile.summary || '',
                seniorityLevel: userProfile.seniorityLevel || 'mid',
            });
            await this.prisma.jobAnalysis.update({
                where: { id: analysisId },
                data: {
                    status: 'COMPLETED',
                    overallScore: analysis.overallScore,
                    skillScore: analysis.skillScore,
                    seniorityScore: analysis.seniorityScore,
                    stackScore: analysis.stackScore,
                    cultureScore: analysis.cultureScore,
                    matchedSkills: analysis.matchedSkills,
                    missingSkills: analysis.missingSkills,
                    highlights: analysis.highlights,
                    gaps: analysis.gaps,
                    recommendation: analysis.recommendation,
                    aiExplanation: analysis.aiExplanation,
                },
            });
            if (job.requiredSkills.length === 0 && analysis.matchedSkills.length > 0) {
                await this.prisma.job.update({
                    where: { id: jobId },
                    data: { requiredSkills: [...analysis.matchedSkills, ...analysis.missingSkills] },
                });
            }
            this.logger.log(`✅ Analysis completed for ${analysisId}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to analyze job: ${error.message}`);
            await this.prisma.jobAnalysis.update({
                where: { id: analysisId },
                data: { status: 'FAILED' },
            }).catch(() => { });
            throw error;
        }
    }
};
exports.JobAnalysisWorker = JobAnalysisWorker;
__decorate([
    (0, bull_1.OnQueueActive)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], JobAnalysisWorker.prototype, "onActive", null);
__decorate([
    (0, bull_1.OnQueueCompleted)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], JobAnalysisWorker.prototype, "onCompleted", null);
__decorate([
    (0, bull_1.OnQueueFailed)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Error]),
    __metadata("design:returntype", void 0)
], JobAnalysisWorker.prototype, "onFailed", null);
__decorate([
    (0, bull_1.Process)('analyze-match'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JobAnalysisWorker.prototype, "handleAnalyzeMatch", null);
exports.JobAnalysisWorker = JobAnalysisWorker = JobAnalysisWorker_1 = __decorate([
    (0, bull_1.Processor)('job-analysis'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], JobAnalysisWorker);
//# sourceMappingURL=job-analysis.worker.js.map