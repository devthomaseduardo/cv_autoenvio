import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOverview(userId: string) {
    const [
      totalApplications,
      applicationsByStatus,
      savedJobs,
      totalJobsAnalyzed,
      scoreDistribution,
      topMatchedJobs,
      applicationsByMonth,
    ] = await Promise.all([
      this.prisma.application.count({ where: { userId } }),

      this.prisma.application.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      }),

      this.prisma.savedJob.count({ where: { userId } }),

      this.prisma.jobAnalysis.count({ where: { userId } }),

      // Score distribution buckets
      Promise.all([
        this.prisma.jobAnalysis.count({ where: { userId, overallScore: { gte: 80 } } }),
        this.prisma.jobAnalysis.count({ where: { userId, overallScore: { gte: 60, lt: 80 } } }),
        this.prisma.jobAnalysis.count({ where: { userId, overallScore: { lt: 60 } } }),
      ]),

      // Top matches
      this.prisma.jobAnalysis.findMany({
        where: { userId },
        orderBy: { overallScore: 'desc' },
        take: 5,
        include: {
          job: { select: { title: true, company: true, workMode: true } },
        },
      }),

      // Applications per month (last 6 months)
      this.prisma.$queryRaw`
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
      }, {} as Record<string, number>),
      scoreDistribution: {
        excellent: scoreDistribution[0],  // 80-100
        good: scoreDistribution[1],       // 60-79
        low: scoreDistribution[2],        // 0-59
      },
      topMatchedJobs,
      applicationsByMonth,
    };
  }

  async getSkillGaps(userId: string) {
    const analyses = await this.prisma.jobAnalysis.findMany({
      where: { userId },
      select: { missingSkills: true, matchedSkills: true },
    });

    // Count skill frequency across all analyses
    const missingCount: Record<string, number> = {};
    const matchedCount: Record<string, number> = {};

    for (const a of analyses) {
      for (const skill of (a.missingSkills as any[])) {
        missingCount[skill] = (missingCount[skill] || 0) + 1;
      }
      for (const skill of (a.matchedSkills as any[])) {
        matchedCount[skill] = (matchedCount[skill] || 0) + 1;
      }
    }

    // Sort by frequency
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
      recommendation: topMissing.slice(0, 3).map((s) =>
        `Learn ${s.skill} - appears missing in ${s.count} jobs you analyzed`,
      ),
    };
  }
}
