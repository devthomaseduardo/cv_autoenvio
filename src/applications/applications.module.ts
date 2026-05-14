import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { ResumesModule } from '../resumes/resumes.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'resume-tailor' }),
    ResumesModule,
  ],
  providers: [ApplicationsService],
  controllers: [ApplicationsController],
})
export class ApplicationsModule {}
