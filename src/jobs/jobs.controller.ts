import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JobsService } from './jobs.service';
import { SubmitJobUrlDto, CreateJobManuallyDto, JobQueryDto } from './dto/jobs.dto';

@ApiTags('jobs')
@Controller('jobs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  /**
   * THE CORE ENDPOINT
   * User pastes URL → scrape → queue → AI → match score
   */
  @Post('submit')
  @ApiOperation({
    summary: '🎯 Submit a job URL for AI analysis',
    description:
      'Paste any job URL (LinkedIn, Gupy, Indeed...) and the system will ' +
      'scrape the description, analyze requirements and compute your match score.',
  })
  @ApiResponse({ status: 201, description: 'Job queued for AI analysis' })
  async submitJobUrl(
    @Body() dto: SubmitJobUrlDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.jobsService.submitJobUrl(dto, user.id);
  }

  @Post('manual')
  @ApiOperation({ summary: 'Add job manually (paste description)' })
  async createManual(
    @Body() dto: CreateJobManuallyDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.jobsService.createManual(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all jobs with match scores' })
  async listJobs(
    @Query() query: JobQueryDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.jobsService.listJobs(query, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job details + AI analysis' })
  @ApiParam({ name: 'id', description: 'Job ID (UUID)' })
  async getJob(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.jobsService.getJobWithAnalysis(id, user.id);
  }

  @Get(':id/analysis')
  @ApiOperation({ summary: 'Get AI match analysis for a job' })
  async getAnalysis(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.jobsService.getAnalysis(id, user.id);
  }

  @Post(':id/save')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save / unsave a job' })
  async toggleSave(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.jobsService.toggleSaveJob(id, user.id);
  }
}
