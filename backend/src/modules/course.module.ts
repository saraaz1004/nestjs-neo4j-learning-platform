// src/modules/course.module.ts
import { Module } from '@nestjs/common';
import { CourseController } from 'src/controllers/course.controller';
import { CourseService } from 'src/services/course.service';

@Module({
  imports: [],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
