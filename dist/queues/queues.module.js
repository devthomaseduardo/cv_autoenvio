"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueuesModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const job_analysis_worker_1 = require("./workers/job-analysis.worker");
const resume_tailor_worker_1 = require("./workers/resume-tailor.worker");
const ai_module_1 = require("../ai/ai.module");
let QueuesModule = class QueuesModule {
};
exports.QueuesModule = QueuesModule;
exports.QueuesModule = QueuesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bull_1.BullModule.registerQueue({ name: 'job-analysis' }, { name: 'resume-tailor' }),
            ai_module_1.AiModule,
        ],
        providers: [job_analysis_worker_1.JobAnalysisWorker, resume_tailor_worker_1.ResumeTailorWorker],
        exports: [bull_1.BullModule],
    })
], QueuesModule);
//# sourceMappingURL=queues.module.js.map