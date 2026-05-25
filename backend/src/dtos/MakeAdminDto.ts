// src/dtos/MakeAdminDto.ts
import { IsString, MinLength } from 'class-validator';

export class MakeAdminDto {
  @IsString()
  @MinLength(1)
  username: string;
}
