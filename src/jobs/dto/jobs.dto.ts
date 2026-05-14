import { IsUrl, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum JobSource {
  LINKEDIN = 'linkedin',
  GUPY = 'gupy',
  INDEED = 'indeed',
  GLASSDOOR = 'glassdoor',
  MANUAL = 'manual',
}

export class SubmitJobUrlDto {
  @ApiProperty({
    example: 'https://www.linkedin.com/jobs/view/123456789/',
    description: 'Job posting URL to analyze',
  })
  @IsUrl({}, { message: 'Please provide a valid URL' })
  url: string;
}

export class CreateJobManuallyDto {
  @ApiProperty({ example: 'Senior Full Stack Developer' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  company: string;

  @ApiProperty({ description: 'Full job description' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'São Paulo, SP' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ enum: ['remote', 'hybrid', 'onsite'] })
  @IsOptional()
  @IsString()
  workMode?: string;

  @ApiPropertyOptional({ example: 'https://company.com/jobs/123' })
  @IsOptional()
  @IsUrl()
  sourceUrl?: string;
}

export class JobQueryDto {
  @ApiPropertyOptional({ example: 'React' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['remote', 'hybrid', 'onsite'] })
  @IsOptional()
  @IsString()
  workMode?: string;

  @ApiPropertyOptional({ example: '1', description: 'Page number' })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: '20', description: 'Items per page' })
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Minimum match score (0-100)' })
  @IsOptional()
  minScore?: number;
}
