// src/dtos/EnrollCourseDto.ts

import { IsNotEmpty, IsString } from 'class-validator';

export class EnrollCourseDto {
  @IsNotEmpty()
  @IsString()
  studentUsername: string;

  @IsNotEmpty()
  @IsString()
  courseSlug: string;
}
