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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const jobs_service_1 = require("./jobs.service");
const jobs_dto_1 = require("./dto/jobs.dto");
let JobsController = class JobsController {
    constructor(jobsService) {
        this.jobsService = jobsService;
    }
    async submitJobUrl(dto, user) {
        return this.jobsService.submitJobUrl(dto, user.id);
    }
    async createManual(dto, user) {
        return this.jobsService.createManual(dto, user.id);
    }
    async listJobs(query, user) {
        return this.jobsService.listJobs(query, user.id);
    }
    async getJob(id, user) {
        return this.jobsService.getJobWithAnalysis(id, user.id);
    }
    async getAnalysis(id, user) {
        return this.jobsService.getAnalysis(id, user.id);
    }
    async toggleSave(id, user) {
        return this.jobsService.toggleSaveJob(id, user.id);
    }
};
exports.JobsController = JobsController;
__decorate([
    (0, swagger_1.ApiOperation)({ description: "THE CORE ENDPOINT\nUser pastes URL \u2192 scrape \u2192 queue \u2192 AI \u2192 match score", summary: '🎯 Submit a job URL for AI analysis',
        description: 'Paste any job URL (LinkedIn, Gupy, Indeed...) and the system will ' +
            'scrape the description, analyze requirements and compute your match score.' }),
    (0, common_1.Post)('submit'),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Job queued for AI analysis' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [jobs_dto_1.SubmitJobUrlDto, Object]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "submitJobUrl", null);
__decorate([
    (0, common_1.Post)('manual'),
    (0, swagger_1.ApiOperation)({ summary: 'Add job manually (paste description)' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [jobs_dto_1.CreateJobManuallyDto, Object]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "createManual", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all jobs with match scores' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [jobs_dto_1.JobQueryDto, Object]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "listJobs", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get job details + AI analysis' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Job ID (UUID)' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "getJob", null);
__decorate([
    (0, common_1.Get)(':id/analysis'),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI match analysis for a job' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "getAnalysis", null);
__decorate([
    (0, common_1.Post)(':id/save'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Save / unsave a job' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "toggleSave", null);
exports.JobsController = JobsController = __decorate([
    (0, swagger_1.ApiTags)('jobs'),
    (0, common_1.Controller)('jobs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __metadata("design:paramtypes", [jobs_service_1.JobsService])
], JobsController);
//# sourceMappingURL=jobs.controller.js.map