// src/services/course.service.ts

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Driver } from 'neo4j-driver';
import { randomUUID } from 'crypto';
import { CreateCourseDto } from 'src/dtos/CreateCourseDto';
import { Course } from 'src/entities/course.entity';
import { UpdateCourseDto } from 'src/dtos/UpdateCourseDto';

@Injectable()
export class CourseService {
  constructor(
    @Inject('NEO4J_DRIVER') private readonly driver: Driver,
    @Inject('NEO4J_DATABASE') private readonly database: string,
  ) {}

  // ✅ CREATE course: samo Instructor može (Student + Instructor label)
  async createCourse(courseData: CreateCourseDto): Promise<Course> {
    const session = this.driver.session({ database: this.database });
    const id = randomUUID();

    try {
      const result = await session.run(
        `
        MATCH (s:Student:Instructor { username: $instructorUsername })
        CREATE (c:Course {
          id: $id,
          name: $name,
          slug: $slug,
          description: $description,
          image: $image,
          createdAt: toString(datetime())
        })
        CREATE (s)-[:CREATED { createdAt: datetime() }]->(c)
        RETURN c
        `,
        {
          id,
          instructorUsername: courseData.instructorUsername,
          name: courseData.name,
          slug: courseData.slug,
          description: courseData.description,
          image: courseData.image,
        },
      );

      if (result.records.length === 0) {
        throw new BadRequestException(
          'Instruktor sa ovim username-om ne postoji ili nema Instructor privilegije (label Instructor).',
        );
      }

      const c = result.records[0].get('c').properties;

      return {
        id: String(c.id),
        slug: String(c.slug),
        name: String(c.name),
        image: c.image ? String(c.image) : '',
        description: c.description ? String(c.description) : '',
        createdAt: c.createdAt ? String(c.createdAt) : '',
      };
    } finally {
      await session.close();
    }
  }

  // ✅ GET svi kursevi
  async getAllCourses(): Promise<Course[]> {
    const session = this.driver.session({ database: this.database });

    try {
      const result = await session.run(
        `
        MATCH (c:Course)
        RETURN c
        ORDER BY c.createdAt DESC
        `,
      );

      return result.records.map((record) => {
        const c = record.get('c').properties;

        return {
          id: String(c.id),
          slug: String(c.slug),
          name: String(c.name),
          image: c.image ? String(c.image) : '',
          description: c.description ? String(c.description) : '',
          createdAt: c.createdAt ? String(c.createdAt) : '',
        };
      });
    } finally {
      await session.close();
    }
  }

  // ✅ DETAILS kursa + studenti
  async getCourseDetails(slug: string): Promise<{
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    createdAt: string;
    studentsCount: number;
    students: { username: string; email: string; createdAt: string }[];
  }> {
    const session = this.driver.session({ database: this.database });

    try {
      const result = await session.run(
        `
        MATCH (c:Course { slug: $slug })
        OPTIONAL MATCH (s:Student)-[:ENROLLED_IN]->(c)
        RETURN
          c {
            .id,
            .name,
            .slug,
            .description,
            .image,
            createdAt: toString(c.createdAt)
          } AS course,
          count(s) AS studentsCount,
          collect(
            s {
              .username,
              .email,
              createdAt: toString(s.createdAt)
            }
          ) AS students
        `,
        { slug },
      );

      if (result.records.length === 0) {
        throw new BadRequestException('Kurs sa ovim slug-om ne postoji');
      }

      const record = result.records[0];

      return {
        ...record.get('course'),
        studentsCount:
          typeof record.get('studentsCount')?.toNumber === 'function'
            ? record.get('studentsCount').toNumber()
            : Number(record.get('studentsCount')),
        students: record.get('students').filter((s) => s && s.username),
      };
    } finally {
      await session.close();
    }
  }

  // ✅ UPDATE kurs
  async updateCourse(slug: string, dto: UpdateCourseDto): Promise<Course> {
    const session = this.driver.session({ database: this.database });

    try {
      const result = await session.run(
        `
        MATCH (c:Course { slug: $slug })
        SET
          c.name = coalesce($name, c.name),
          c.slug = coalesce($newSlug, c.slug),
          c.description = coalesce($description, c.description),
          c.image = coalesce($image, c.image)
        RETURN c
        `,
        {
          slug,
          name: dto.name ?? null,
          newSlug: dto.slug ?? null,
          description: dto.description ?? null,
          image: dto.image ?? null,
        },
      );

      if (result.records.length === 0) {
        throw new BadRequestException('Kurs sa ovim slug-om ne postoji');
      }

      const c = result.records[0].get('c').properties;

      return {
        id: String(c.id),
        slug: String(c.slug),
        name: String(c.name),
        image: c.image ? String(c.image) : '',
        description: c.description ? String(c.description) : '',
        createdAt: c.createdAt ? String(c.createdAt) : '',
      };
    } finally {
      await session.close();
    }
  }

  // ✅ DELETE kurs (briše enroll relacije + created relacije + node)
  async deleteCourse(slug: string): Promise<boolean> {
    const session = this.driver.session({ database: this.database });

    try {
      const res = await session.run(
        `
        MATCH (c:Course { slug: $slug })
        OPTIONAL MATCH (s:Student)-[r:ENROLLED_IN]->(c)
        DELETE r
        WITH c
        OPTIONAL MATCH ()-[cr:CREATED]->(c)
        DELETE cr
        WITH c
        DETACH DELETE c
        RETURN true AS ok
        `,
        { slug },
      );

      if (res.records.length === 0) {
        throw new BadRequestException('Kurs sa ovim slug-om ne postoji');
      }

      return true;
    } finally {
      await session.close();
    }
  }
}

