// src/entities/course.entity.ts

export interface Course {
  id: string;
  slug: string;
  name: string;
  image: string;
  description: string;
  createdAt: string; // vratimo kao string iz Neo4j datetime
}
