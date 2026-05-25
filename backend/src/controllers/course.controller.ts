// src/controllers/course.controller.ts

import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateCourseDto } from 'src/dtos/CreateCourseDto';
import { CourseService } from 'src/services/course.service';
import { Course } from 'src/entities/course.entity';
import { UpdateCourseDto } from 'src/dtos/UpdateCourseDto';
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post('create')
  async create(@Body() dto: CreateCourseDto): Promise<Course> {
    return this.courseService.createCourse(dto);
  }

  // ✅ GET http://localhost:3000/courses
  @Get()
  async getAll(): Promise<Course[]> {
    return this.courseService.getAllCourses();
  }
  @Get(':slug/details')
async getCourseDetails(@Param('slug') slug: string) {
  return this.courseService.getCourseDetails(slug);
}

@Patch(':slug')
update(@Param('slug') slug: string, @Body() dto: UpdateCourseDto) {
  return this.courseService.updateCourse(slug, dto);
}
@Delete(':slug')
remove(@Param('slug') slug: string) {
  return this.courseService.deleteCourse(slug);
}
}
