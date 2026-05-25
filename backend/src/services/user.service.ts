// src/services/user.service.ts
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Driver } from 'neo4j-driver';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/dtos/CreateUserDto';
import { EnrollCourseDto } from 'src/dtos/EnrollCourseDto';
import { User } from 'src/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject('NEO4J_DRIVER') private readonly driver: Driver,
    @Inject('NEO4J_DATABASE') private readonly database: string,
  ) {}

  // ================= CREATE STUDENT =================
  async createUser(userData: CreateUserDto): Promise<Omit<User, 'password'>> {
    const session = this.driver.session({ database: this.database });

    try {
      const exists = await session.run(
        'MATCH (s:Student { username: $username }) RETURN s LIMIT 1',
        { username: userData.username },
      );

      if (exists.records.length > 0) {
        throw new BadRequestException('Student sa ovim username-om već postoji');
      }

      const hashed = await bcrypt.hash(userData.password, 12);

      const res = await session.run(
        `
        CREATE (s:Student {
          username: $username,
          email: $email,
          password: $password,
          createdAt: toString(datetime())
        })
        RETURN s
        `,
        {
          username: userData.username,
          email: userData.email,
          password: hashed,
        },
      );

      const student = res.records[0].get('s').properties;
      // ukloni password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...studentWithoutPassword } = student;

      return studentWithoutPassword as Omit<User, 'password'>;
    } finally {
      await session.close();
    }
  }

  // ================= ENROLL =================
  async enrollCourse(dto: EnrollCourseDto): Promise<boolean> {
    const session = this.driver.session({ database: this.database });

    try {
      const res = await session.run(
        `
        MATCH (s:Student { username: $studentUsername })
        MATCH (c:Course { slug: $courseSlug })
        MERGE (s)-[r:ENROLLED_IN]->(c)
        ON CREATE SET r.enrolledAt = toString(datetime())
        RETURN r
        `,
        dto,
      );

      if (res.records.length === 0) {
        throw new BadRequestException('Student ili kurs ne postoji');
      }

      return true;
    } finally {
      await session.close();
    }
  }

  // ================= UNENROLL =================
  async unenrollCourse(dto: EnrollCourseDto): Promise<boolean> {
    const session = this.driver.session({ database: this.database });

    try {
      const res = await session.run(
        `
        MATCH (s:Student { username: $studentUsername })-[r:ENROLLED_IN]->(c:Course { slug: $courseSlug })
        DELETE r
        RETURN true AS ok
        `,
        dto,
      );

      if (res.records.length === 0) {
        throw new BadRequestException('Veza ne postoji');
      }

      return true;
    } finally {
      await session.close();
    }
  }

  // ================= GET STUDENTS FOR COURSE =================
  async getStudentsForCourse(courseSlug: string): Promise<Omit<User, 'password'>[]> {
    const session = this.driver.session({ database: this.database });

    try {
      const res = await session.run(
        `
        MATCH (s:Student)-[:ENROLLED_IN]->(c:Course { slug: $slug })
        RETURN s
        `,
        { slug: courseSlug },
      );

      return res.records.map((r) => {
        const s = r.get('s').properties;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...rest } = s;
        return rest as Omit<User, 'password'>;
      });
    } finally {
      await session.close();
    }
  }

  // ================= PROMOTE TO INSTRUCTOR =================
  async makeInstructor(username: string) {
    const session = this.driver.session({ database: this.database });

    try {
      const res = await session.run(
        `
        MATCH (s:Student { username: $username })
        SET s:Instructor
        RETURN s
        `,
        { username },
      );

      if (res.records.length === 0) {
        throw new BadRequestException('Student ne postoji');
      }

      return { ok: true, username };
    } finally {
      await session.close();
    }
  }

  // ================= REMOVE INSTRUCTOR =================
  async removeInstructor(username: string) {
    const session = this.driver.session({ database: this.database });

    try {
      const res = await session.run(
        `
        MATCH (s:Student:Instructor { username: $username })
        REMOVE s:Instructor
        RETURN s
        `,
        { username },
      );

      if (res.records.length === 0) {
        throw new BadRequestException('Instruktor ne postoji');
      }

      return { ok: true, username };
    } finally {
      await session.close();
    }
  }

  // ================= PROMOTE TO ADMIN =================
  async makeAdmin(username: string) {
    const session = this.driver.session({ database: this.database });

    try {
      const res = await session.run(
        `
        MATCH (s:Student { username: $username })
        SET s:Admin
        RETURN s
        `,
        { username },
      );

      if (res.records.length === 0) {
        throw new BadRequestException('Student ne postoji');
      }

      return { ok: true, username };
    } finally {
      await session.close();
    }
  }

  // ================= REMOVE ADMIN =================
  async removeAdmin(username: string) {
    const session = this.driver.session({ database: this.database });

    try {
      const res = await session.run(
        `
        MATCH (s:Student:Admin { username: $username })
        REMOVE s:Admin
        RETURN s
        `,
        { username },
      );

      if (res.records.length === 0) {
        throw new BadRequestException('Admin ne postoji');
      }

      return { ok: true, username };
    } finally {
      await session.close();
    }
  }

  // ================= LIST ALL STUDENTS =================
  async getAllStudents(): Promise<Omit<User, 'password'>[]> {
    const session = this.driver.session({ database: this.database });

    try {
      const res = await session.run(
        `
        MATCH (s:Student)
        RETURN s
        ORDER BY s.createdAt DESC
        `,
      );

      return res.records.map((r) => {
        const s = r.get('s').properties;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...rest } = s;
        return rest as Omit<User, 'password'>;
      });
    } finally {
      await session.close();
    }
  }

  // ================= LIST INSTRUCTORS =================
  async getAllInstructors(): Promise<Omit<User, 'password'>[]> {
    const session = this.driver.session({ database: this.database });

    try {
      const res = await session.run(
        `
        MATCH (s:Student:Instructor)
        RETURN s
        ORDER BY s.createdAt DESC
        `,
      );

      return res.records.map((r) => {
        const s = r.get('s').properties;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...rest } = s;
        return rest as Omit<User, 'password'>;
      });
    } finally {
      await session.close();
    }
  }

  // ================= LIST ADMINS =================
  async getAllAdmins(): Promise<Omit<User, 'password'>[]> {
    const session = this.driver.session({ database: this.database });

    try {
      const res = await session.run(
        `
        MATCH (s:Student:Admin)
        RETURN s
        ORDER BY s.createdAt DESC
        `,
      );

      return res.records.map((r) => {
        const s = r.get('s').properties;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...rest } = s;
        return rest as Omit<User, 'password'>;
      });
    } finally {
      await session.close();
    }
  }
}




