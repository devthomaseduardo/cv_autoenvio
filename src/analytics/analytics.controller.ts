import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: '📊 Dashboard analytics overview' })
  getOverview(@CurrentUser() user: { id: string }) {
    return this.analyticsService.getOverview(user.id);
  }

  @Get('skill-gaps')
  @ApiOperation({
    summary: '🎯 Identify your skill gaps',
    description: 'Analyzes all jobs you\'ve submitted to identify the skills you\'re most often missing.',
  })
  getSkillGaps(@CurrentUser() user: { id: string }) {
    return this.analyticsService.getSkillGaps(user.id);
  }
}
