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
exports.JobQueryDto = exports.CreateJobManuallyDto = exports.SubmitJobUrlDto = exports.JobSource = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var JobSource;
(function (JobSource) {
    JobSource["LINKEDIN"] = "linkedin";
    JobSource["GUPY"] = "gupy";
    JobSource["INDEED"] = "indeed";
    JobSource["GLASSDOOR"] = "glassdoor";
    JobSource["MANUAL"] = "manual";
})(JobSource || (exports.JobSource = JobSource = {}));
class SubmitJobUrlDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { url: { required: true, type: () => String } };
    }
}
exports.SubmitJobUrlDto = SubmitJobUrlDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://www.linkedin.com/jobs/view/123456789/',
        description: 'Job posting URL to analyze',
    }),
    (0, class_validator_1.IsUrl)({}, { message: 'Please provide a valid URL' }),
    __metadata("design:type", String)
], SubmitJobUrlDto.prototype, "url", void 0);
class CreateJobManuallyDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { title: { required: true, type: () => String }, company: { required: true, type: () => String }, description: { required: true, type: () => String }, location: { required: false, type: () => String }, workMode: { required: false, type: () => String }, sourceUrl: { required: false, type: () => String } };
    }
}
exports.CreateJobManuallyDto = CreateJobManuallyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Senior Full Stack Developer' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJobManuallyDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Acme Corp' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJobManuallyDto.prototype, "company", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Full job description' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJobManuallyDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'São Paulo, SP' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJobManuallyDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['remote', 'hybrid', 'onsite'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJobManuallyDto.prototype, "workMode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://company.com/jobs/123' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateJobManuallyDto.prototype, "sourceUrl", void 0);
class JobQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { search: { required: false, type: () => String }, workMode: { required: false, type: () => String }, page: { required: false, type: () => Number, default: 1 }, limit: { required: false, type: () => Number, default: 20 }, minScore: { required: false, type: () => Number } };
    }
}
exports.JobQueryDto = JobQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'React' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], JobQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['remote', 'hybrid', 'onsite'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], JobQueryDto.prototype, "workMode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1', description: 'Page number' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], JobQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '20', description: 'Items per page' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], JobQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Minimum match score (0-100)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], JobQueryDto.prototype, "minScore", void 0);
//# sourceMappingURL=jobs.dto.js.map