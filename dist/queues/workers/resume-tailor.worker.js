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
var ResumeTailorWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeTailorWorker = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ai_service_1 = require("../../ai/ai.service");
let ResumeTailorWorker = ResumeTailorWorker_1 = class ResumeTailorWorker {
    constructor(prisma, ai) {
        this.prisma = prisma;
        this.ai = ai;
        this.logger = new common_1.Logger(ResumeTailorWorker_1.name);
    }
    onFailed(job, error) {
        this.logger.error(`❌ Resume tailor failed for job ${job.id}: ${error.message}`);
    }
    async handleTailorResume(bullJob) {
        const { applicationId, jobId, userId, resumeId } = bullJob.data;
        this.logger.log(`✏️ Tailoring resume for application: ${applicationId}`);
        const [application, job, resume, userProfile] = await Promise.all([
            this.prisma.application.findUnique({ where: { id: applicationId } }),
            this.prisma.job.findUnique({ where: { id: jobId } }),
            this.prisma.resume.findUnique({ where: { id: resumeId } }),
            this.prisma.userProfile.findUnique({
                where: { userId },
                include: { skills: true, user: true },
            }),
        ]);
        if (!job || !resume || !userProfile) {
            throw new Error('Missing data for resume tailoring');
        }
        const tailored = await this.ai.tailorResume(resume.content, job.description, job.title, job.company);
        const coverLetter = tailored.coverLetter || await this.ai.generateCoverLetter(job.title, job.company, job.description, userProfile.user, userProfile.summary || '');
        await this.prisma.application.update({
            where: { id: applicationId },
            data: {
                tailoredResume: tailored.tailoredContent,
                coverLetter,
                technicalBrief: tailored.technicalBrief,
                status: 'READY',
            },
        });
        await this.prisma.applicationEvent.create({
            data: {
                applicationId,
                type: 'tailored',
                description: `Resume tailored with ${tailored.keyChanges?.length || 0} optimizations`,
            },
        });
        this.logger.log(`✅ Resume tailored successfully for application: ${applicationId}`);
        return { success: true };
    }
};
exports.ResumeTailorWorker = ResumeTailorWorker;
__decorate([
    (0, bull_1.OnQueueFailed)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Error]),
    __metadata("design:returntype", void 0)
], ResumeTailorWorker.prototype, "onFailed", null);
__decorate([
    (0, bull_1.Process)('tailor-resume'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResumeTailorWorker.prototype, "handleTailorResume", null);
exports.ResumeTailorWorker = ResumeTailorWorker = ResumeTailorWorker_1 = __decorate([
    (0, bull_1.Processor)('resume-tailor'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], ResumeTailorWorker);
//# sourceMappingURL=resume-tailor.worker.js.map