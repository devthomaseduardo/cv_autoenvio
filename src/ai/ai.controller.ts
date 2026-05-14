import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class AnalyzeDto {
  @ApiProperty()
  @IsString()
  jobDescription: string;
}

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('extract-skills')
  @ApiOperation({ summary: 'Extract skills from a job description text' })
  async extractSkills(@Body() dto: AnalyzeDto) {
    return this.aiService.extractJobSkills(dto.jobDescription);
  }
}
