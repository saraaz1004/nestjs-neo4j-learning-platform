import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from 'src/services/user.service';
import { User } from 'src/entities/user.entity';
import { CreateUserDto } from 'src/dtos/CreateUserDto';
import { EnrollCourseDto } from 'src/dtos/EnrollCourseDto';
import { MakeInstructorDto } from 'src/dtos/MakeInstructorDto';
import { MakeAdminDto } from 'src/dtos/MakeAdminDto';

@Controller('students')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // CREATE STUDENT
  @Post('create')
  async createStudent(@Body() data: CreateUserDto): Promise<Omit<User, 'password'>> {
    return this.userService.createUser(data);
  }

  // ENROLL / UNENROLL
  @Post('enroll')
  async enroll(@Body() data: EnrollCourseDto): Promise<boolean> {
    return this.userService.enrollCourse(data);
  }

  @Post('unenroll')
  async unenroll(@Body() data: EnrollCourseDto): Promise<boolean> {
    return this.userService.unenrollCourse(data);
  }

  // STUDENTS FOR COURSE
  @Get('course/:slug/students')
  async getStudentsForCourse(@Param('slug') slug: string): Promise<Omit<User, 'password'>[]> {
    return this.userService.getStudentsForCourse(slug);
  }

  // INSTRUCTOR ROLE
  @Post('make-instructor')
  async makeInstructor(@Body() dto: MakeInstructorDto) {
    return this.userService.makeInstructor(dto.username);
  }

  @Post('remove-instructor')
  async removeInstructor(@Body() dto: MakeInstructorDto) {
    return this.userService.removeInstructor(dto.username);
  }

  // LISTS
  @Get()
  async getAllStudents() {
    return this.userService.getAllStudents();
  }

  @Get('instructors')
  async getAllInstructors() {
    return this.userService.getAllInstructors();
  }

  @Get('admins')
  async getAllAdmins() {
    return this.userService.getAllAdmins();
  }

  // ADMIN ROLE
  @Post('make-admin')
  async makeAdmin(@Body() dto: MakeAdminDto) {
    return this.userService.makeAdmin(dto.username);
  }

  @Post('remove-admin')
  async removeAdmin(@Body() dto: MakeAdminDto) {
    return this.userService.removeAdmin(dto.username);
  }
}




