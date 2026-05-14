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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOverview(userId) {
        const [totalApplications, applicationsByStatus, savedJobs, totalJobsAnalyzed, scoreDistribution, topMatchedJobs, applicationsByMonth,] = await Promise.all([
            this.prisma.application.count({ where: { userId } }),
            this.prisma.application.groupBy({
                by: ['status'],
                where: { userId },
                _count: true,
            }),
            this.prisma.savedJob.count({ where: { userId } }),
            this.prisma.jobAnalysis.count({ where: { userId } }),
            Promise.all([
                this.prisma.jobAnalysis.count({ where: { userId, overallScore: { gte: 80 } } }),
                this.prisma.jobAnalysis.count({ where: { userId, overallScore: { gte: 60, lt: 80 } } }),
                this.prisma.jobAnalysis.count({ where: { userId, overallScore: { lt: 60 } } }),
            ]),
            this.prisma.jobAnalysis.findMany({
                where: { userId },
                orderBy: { overallScore: 'desc' },
                take: 5,
                include: {
                    job: { select: { title: true, company: true, workMode: true } },
                },
            }),
            this.prisma.$queryRaw `
        SELECT
          TO_CHAR(created_at, 'YYYY-MM') AS month,
          COUNT(*) AS count
        FROM applications
        WHERE user_id = ${userId}
          AND created_at >= NOW() - INTERVAL '6 months'
        GROUP BY month
        ORDER BY month
      `,
        ]);
        const avgScore = await this.prisma.jobAnalysis.aggregate({
            where: { userId },
            _avg: { overallScore: true },
        });
        return {
            summary: {
                totalApplications,
                savedJobs,
                totalJobsAnalyzed,
                averageMatchScore: Math.round(avgScore._avg.overallScore || 0),
            },
            applicationsByStatus: applicationsByStatus.reduce((acc, item) => {
                acc[item.status] = item._count;
                return acc;
            }, {}),
            scoreDistribution: {
                excellent: scoreDistribution[0],
                good: scoreDistribution[1],
                low: scoreDistribution[2],
            },
            topMatchedJobs,
            applicationsByMonth,
        };
    }
    async getSkillGaps(userId) {
        const analyses = await this.prisma.jobAnalysis.findMany({
            where: { userId },
            select: { missingSkills: true, matchedSkills: true },
        });
        const missingCount = {};
        const matchedCount = {};
        for (const a of analyses) {
            for (const skill of a.missingSkills) {
                missingCount[skill] = (missingCount[skill] || 0) + 1;
            }
            for (const skill of a.matchedSkills) {
                matchedCount[skill] = (matchedCount[skill] || 0) + 1;
            }
        }
        const topMissing = Object.entries(missingCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([skill, count]) => ({ skill, count }));
        const topMatched = Object.entries(matchedCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([skill, count]) => ({ skill, count }));
        return {
            topMissingSkills: topMissing,
            topMatchedSkills: topMatched,
            recommendation: topMissing.slice(0, 3).map((s) => `Learn ${s.skill} - appears missing in ${s.count} jobs you analyzed`),
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map