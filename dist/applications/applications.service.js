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
exports.ApplicationsService = exports.CreateApplicationDto = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../prisma/prisma.service");
const resumes_service_1 = require("../resumes/resumes.service");
class CreateApplicationDto {
}
exports.CreateApplicationDto = CreateApplicationDto;
let ApplicationsService = class ApplicationsService {
    constructor(prisma, resumes, tailorQueue) {
        this.prisma = prisma;
        this.resumes = resumes;
        this.tailorQueue = tailorQueue;
    }
    async create(dto, userId) {
        let resumeId = dto.resumeId;
        if (!resumeId) {
            const base = await this.resumes.getBaseResume(userId).catch(() => null);
            resumeId = base?.id;
        }
        const application = await this.prisma.application.create({
            data: {
                userId,
                jobId: dto.jobId,
                resumeId,
                notes: dto.notes,
                status: 'PENDING',
            },
        });
        if (resumeId) {
            await this.tailorQueue.add('tailor-resume', {
                applicationId: application.id,
                jobId: dto.jobId,
                userId,
                resumeId,
            });
        }
        return {
            application,
            message: 'Application created. AI is tailoring your resume...',
        };
    }
    async findAll(userId) {
        return this.prisma.application.findMany({
            where: { userId },
            include: {
                job: { select: { title: true, company: true, location: true, workMode: true } },
                resume: { select: { title: true } },
                events: { orderBy: { occurredAt: 'desc' }, take: 5 },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, userId) {
        return this.prisma.application.findFirst({
            where: { id, userId },
            include: {
                job: true,
                resume: true,
                events: { orderBy: { occurredAt: 'desc' } },
            },
        });
    }
    async updateStatus(id, status, userId) {
        const application = await this.prisma.application.update({
            where: { id },
            data: { status: status },
        });
        await this.prisma.applicationEvent.create({
            data: {
                applicationId: id,
                type: status.toLowerCase(),
                description: `Status updated to ${status}`,
            },
        });
        return application;
    }
    async getStats(userId) {
        const [total, byStatus, averageScore] = await Promise.all([
            this.prisma.application.count({ where: { userId } }),
            this.prisma.application.groupBy({
                by: ['status'],
                where: { userId },
                _count: true,
            }),
            this.prisma.jobAnalysis.aggregate({
                where: { userId },
                _avg: { overallScore: true },
            }),
        ]);
        return {
            total,
            byStatus: byStatus.reduce((acc, item) => {
                acc[item.status] = item._count;
                return acc;
            }, {}),
            averageMatchScore: Math.round(averageScore._avg.overallScore || 0),
        };
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bull_1.InjectQueue)('resume-tailor')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        resumes_service_1.ResumesService, Object])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map