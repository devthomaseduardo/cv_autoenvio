import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { JobAnalysisWorker } from './workers/job-analysis.worker';
import { ResumeTailorWorker } from './workers/resume-tailor.worker';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'job-analysis' },
      { name: 'resume-tailor' },
    ),
    AiModule,
  ],
  providers: [JobAnalysisWorker, ResumeTailorWorker],
  exports: [BullModule],
})
export class QueuesModule {}
