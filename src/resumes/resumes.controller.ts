import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ResumesService } from './resumes.service';
import { CreateResumeDto, UpdateResumeDto } from './dto/resumes.dto';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class TailorDto {
  @ApiProperty() @IsString() resumeId: string;
  @ApiProperty() @IsString() jobId: string;
}

@ApiTags('resumes')
@Controller('resumes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new resume' })
  create(@Body() dto: CreateResumeDto, @CurrentUser() user: { id: string }) {
    return this.resumesService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all your resumes' })
  findAll(@CurrentUser() user: { id: string }) {
    return this.resumesService.findAll(user.id);
  }

  @Get('base')
  @ApiOperation({ summary: 'Get your base/master resume' })
  getBase(@CurrentUser() user: { id: string }) {
    return this.resumesService.getBaseResume(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get resume by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.resumesService.findOne(id, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a resume' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateResumeDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.resumesService.update(id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a resume' })
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.resumesService.remove(id, user.id);
  }

  @Post('tailor')
  @ApiOperation({
    summary: '🎯 AI: Tailor a resume for a specific job',
    description: 'Provide a base resume ID and a job ID. AI will rewrite the resume to maximize match.',
  })
  tailor(@Body() dto: TailorDto, @CurrentUser() user: { id: string }) {
    return this.resumesService.tailorForJob(dto.resumeId, dto.jobId, user.id);
  }
}
