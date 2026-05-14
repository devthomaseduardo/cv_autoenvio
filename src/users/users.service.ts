import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: { include: { skills: true } },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    const { password, ...safe } = user;
    return safe;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const { skills, ...profileData } = dto;

    // Update profile fields
    const profile = await this.prisma.userProfile.upsert({
      where: { userId },
      create: { userId, ...profileData },
      update: profileData,
    });

    // Replace skills if provided
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

  async getDashboardData(userId: string) {
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

  private calculateProfileCompletion(profile: any): number {
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
}
