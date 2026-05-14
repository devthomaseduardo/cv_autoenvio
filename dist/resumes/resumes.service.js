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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumesService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
let ResumesService = class ResumesService {
    constructor(prisma, ai, tailorQueue) {
        this.prisma = prisma;
        this.ai = ai;
        this.tailorQueue = tailorQueue;
    }
    async create(dto, userId) {
        const content = {
            summary: dto.summary,
            experience: dto.experience || [],
            education: dto.education || [],
            skills: dto.skills || [],
            languages: dto.languages || [],
            certifications: dto.certifications || [],
            projects: dto.projects || [],
        };
        if (dto.isBase) {
            await this.prisma.resume.updateMany({
                where: { userId, isBase: true },
                data: { isBase: false },
            });
        }
        return this.prisma.resume.create({
            data: {
                userId,
                title: dto.title,
                isBase: dto.isBase ?? false,
                content: content,
            },
        });
    }
    async findAll(userId) {
        return this.prisma.resume.findMany({
            where: { userId },
            orderBy: [{ isBase: 'desc' }, { createdAt: 'desc' }],
        });
    }
    async findOne(id, userId) {
        const resume = await this.prisma.resume.findUnique({ where: { id } });
        if (!resume)
            throw new common_1.NotFoundException('Resume not found');
        if (resume.userId !== userId)
            throw new common_1.ForbiddenException();
        return resume;
    }
    async update(id, dto, userId) {
        await this.findOne(id, userId);
        return this.prisma.resume.update({ where: { id }, data: dto });
    }
    async remove(id, userId) {
        await this.findOne(id, userId);
        return this.prisma.resume.delete({ where: { id } });
    }
    async tailorForJob(resumeId, jobId, userId) {
        const [resume, job] = await Promise.all([
            this.findOne(resumeId, userId),
            this.prisma.job.findUnique({ where: { id: jobId } }),
        ]);
        if (!job)
            throw new common_1.NotFoundException('Job not found');
        const tailored = await this.ai.tailorResume(resume.content, job.description, job.title, job.company);
        const tailoredResume = await this.prisma.resume.create({
            data: {
                userId,
                title: `${resume.title} → ${job.company} (${job.title})`,
                isBase: false,
                content: tailored.tailoredContent,
                version: (resume.version || 1) + 1,
            },
        });
        return {
            resume: tailoredResume,
            coverLetter: tailored.coverLetter,
            technicalBrief: tailored.technicalBrief,
            keyChanges: tailored.keyChanges,
        };
    }
    async getBaseResume(userId) {
        const resume = await this.prisma.resume.findFirst({
            where: { userId, isBase: true },
        });
        if (!resume)
            throw new common_1.NotFoundException('No base resume found. Please create one first.');
        return resume;
    }
};
exports.ResumesService = ResumesService;
exports.ResumesService = ResumesService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bull_1.InjectQueue)('resume-tailor')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService, Object])
], ResumesService);
//# sourceMappingURL=resumes.service.js.map