"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateResumeDto = exports.CreateResumeDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class ExperienceItemDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { company: { required: true, type: () => String }, role: { required: true, type: () => String }, startDate: { required: true, type: () => String }, endDate: { required: false, type: () => String }, description: { required: true, type: () => String }, highlights: { required: false, type: () => [String] } };
    }
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExperienceItemDto.prototype, "company", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExperienceItemDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExperienceItemDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExperienceItemDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExperienceItemDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ExperienceItemDto.prototype, "highlights", void 0);
class EducationItemDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { institution: { required: true, type: () => String }, degree: { required: true, type: () => String }, field: { required: true, type: () => String }, startDate: { required: true, type: () => String }, endDate: { required: false, type: () => String } };
    }
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EducationItemDto.prototype, "institution", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EducationItemDto.prototype, "degree", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EducationItemDto.prototype, "field", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EducationItemDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EducationItemDto.prototype, "endDate", void 0);
class SkillItemDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String }, level: { required: false, type: () => String } };
    }
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SkillItemDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SkillItemDto.prototype, "level", void 0);
class CreateResumeDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { title: { required: true, type: () => String }, isBase: { required: false, type: () => Boolean }, summary: { required: true, type: () => String }, experience: { required: false, type: () => [ExperienceItemDto] }, education: { required: false, type: () => [EducationItemDto] }, skills: { required: false, type: () => [SkillItemDto] }, languages: { required: false }, certifications: { required: false }, projects: { required: false } };
    }
}
exports.CreateResumeDto = CreateResumeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Base Resume - Full Stack Developer' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateResumeDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Mark as the master/base resume' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateResumeDto.prototype, "isBase", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Professional summary / headline' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateResumeDto.prototype, "summary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ExperienceItemDto),
    __metadata("design:type", Array)
], CreateResumeDto.prototype, "experience", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => EducationItemDto),
    __metadata("design:type", Array)
], CreateResumeDto.prototype, "education", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SkillItemDto),
    __metadata("design:type", Array)
], CreateResumeDto.prototype, "skills", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateResumeDto.prototype, "languages", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateResumeDto.prototype, "certifications", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateResumeDto.prototype, "projects", void 0);
class UpdateResumeDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { title: { required: false, type: () => String }, isBase: { required: false, type: () => Boolean }, summary: { required: false, type: () => String } };
    }
}
exports.UpdateResumeDto = UpdateResumeDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateResumeDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateResumeDto.prototype, "isBase", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateResumeDto.prototype, "summary", void 0);
//# sourceMappingURL=resumes.dto.js.map