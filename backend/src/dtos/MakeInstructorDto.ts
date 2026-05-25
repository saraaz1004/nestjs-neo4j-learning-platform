import { IsString, MinLength } from 'class-validator';

export class MakeInstructorDto {
  @IsString()
  @MinLength(1)
  username: string;
}