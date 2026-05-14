import { IsOptional, IsString, IsArray, ValidateNested, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class SkillDto {
  @IsString() name: string;
  @IsOptional() @IsString() level?: string;
  @IsOptional() @IsNumber() yearsExp?: number;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Senior Full Stack Developer' })
  @IsOptional() @IsString() headline?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() summary?: string;

  @ApiPropertyOptional({ example: 'São Paulo, SP' })
  @IsOptional() @IsString() location?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() linkedinUrl?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() githubUrl?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() portfolioUrl?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional() @IsNumber() @Min(0) @Max(50) yearsExp?: number;

  @ApiPropertyOptional({ enum: ['junior', 'mid', 'senior', 'lead', 'staff'] })
  @IsOptional() @IsString() seniorityLevel?: string;

  @ApiPropertyOptional({ example: 10000 })
  @IsOptional() @IsNumber() desiredSalary?: number;

  @ApiPropertyOptional({ example: ['remote', 'hybrid'] })
  @IsOptional() @IsArray() availableFor?: string[];

  @ApiPropertyOptional({ description: 'Array of skills with name, level, yearsExp' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  skills?: SkillDto[];
}
