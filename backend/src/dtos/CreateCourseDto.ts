// src/dtos/CreateCourseDto.ts

import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  instructorUsername: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug mora biti u formatu npr: 'web-development-basics'",
  })
  slug: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  description: string;

  @IsNotEmpty()
  @IsString()
  image: string;
}
