import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class ExperienceItemDto {
  @ApiProperty() @IsString() company: string;
  @ApiProperty() @IsString() role: string;
  @ApiProperty() @IsString() startDate: string;
  @ApiPropertyOptional() @IsOptional() @IsString() endDate?: string;
  @ApiProperty() @IsString() description: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() highlights?: string[];
}

class EducationItemDto {
  @ApiProperty() @IsString() institution: string;
  @ApiProperty() @IsString() degree: string;
  @ApiProperty() @IsString() field: string;
  @ApiProperty() @IsString() startDate: string;
  @ApiPropertyOptional() @IsOptional() @IsString() endDate?: string;
}

class SkillItemDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() level?: string;
}

export class CreateResumeDto {
  @ApiProperty({ example: 'Base Resume - Full Stack Developer' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Mark as the master/base resume' })
  @IsOptional()
  @IsBoolean()
  isBase?: boolean;

  @ApiProperty({ description: 'Professional summary / headline' })
  @IsString()
  summary: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceItemDto)
  experience?: ExperienceItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationItemDto)
  education?: EducationItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillItemDto)
  skills?: SkillItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  languages?: { name: string; level: string }[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  certifications?: { name: string; issuer: string; date: string; url?: string }[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  projects?: { name: string; description: string; url?: string; stack: string[] }[];
}

export class UpdateResumeDto {
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isBase?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() summary?: string;
}
