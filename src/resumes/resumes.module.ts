import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ResumesService } from './resumes.service';
import { ResumesController } from './resumes.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'resume-tailor' }),
    AiModule,
  ],
  providers: [ResumesService],
  controllers: [ResumesController],
  exports: [ResumesService],
})
export class ResumesModule {}
