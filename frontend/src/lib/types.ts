export type Course = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  createdAt?: string;
};

export type StudentPublic = {
  username: string;
  email: string;
  createdAt?: string;
};

export type CourseDetails = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  createdAt: string;
  studentsCount: number;
  students: StudentPublic[];
};
