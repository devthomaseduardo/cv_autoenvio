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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: { include: { skills: true } },
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const { password, ...safe } = user;
        return safe;
    }
    async updateProfile(userId, dto) {
        const { skills, ...profileData } = dto;
        const profile = await this.prisma.userProfile.upsert({
            where: { userId },
            create: { userId, ...profileData },
            update: profileData,
        });
        if (skills) {
            await this.prisma.skill.deleteMany({ where: { profileId: profile.id } });
            await this.prisma.skill.createMany({
                data: skills.map((s) => ({
                    profileId: profile.id,
                    name: s.name,
                    level: s.level || 'intermediate',
                    yearsExp: s.yearsExp,
                })),
            });
        }
        return this.getProfile(userId);
    }
    async getDashboardData(userId) {
        const [profile, totalApplications, savedJobs, recentAnalyses] = await Promise.all([
            this.getProfile(userId),
            this.prisma.application.count({ where: { userId } }),
            this.prisma.savedJob.count({ where: { userId } }),
            this.prisma.jobAnalysis.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: { job: { select: { title: true, company: true } } },
            }),
        ]);
        const avgScore = recentAnalyses.length > 0
            ? Math.round(recentAnalyses.reduce((s, a) => s + a.overallScore, 0) / recentAnalyses.length)
            : 0;
        return {
            profile,
            stats: {
                totalApplications,
                savedJobs,
                averageMatchScore: avgScore,
                profileCompletion: this.calculateProfileCompletion(profile),
            },
            recentAnalyses,
        };
    }
    calculateProfileCompletion(profile) {
        const fields = [
            profile.profile?.headline,
            profile.profile?.summary,
            profile.profile?.location,
            profile.profile?.yearsExp,
            profile.profile?.seniorityLevel,
            profile.profile?.skills?.length > 0,
            profile.profile?.linkedinUrl || profile.profile?.githubUrl,
        ];
        const filled = fields.filter(Boolean).length;
        return Math.round((filled / fields.length) * 100);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map