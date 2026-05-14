import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApplicationsService, CreateApplicationDto } from './applications.service';
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateAppDto {
  @ApiProperty() @IsString() jobId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() resumeId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

class UpdateStatusDto {
  @ApiProperty({ enum: ['PENDING', 'READY', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN'] })
  @IsString()
  status: string;
}

@ApiTags('applications')
@Controller('applications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({
    summary: '🚀 Start an application (AI tailors your resume automatically)',
  })
  create(@Body() dto: CreateAppDto, @CurrentUser() user: { id: string }) {
    return this.applicationsService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all your applications' })
  findAll(@CurrentUser() user: { id: string }) {
    return this.applicationsService.findAll(user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get application statistics and match scores' })
  getStats(@CurrentUser() user: { id: string }) {
    return this.applicationsService.getStats(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application details + tailored resume + cover letter' })
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.applicationsService.findOne(id, user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update application status (interview, offer, rejected...)' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.applicationsService.updateStatus(id, dto.status, user.id);
  }
}
