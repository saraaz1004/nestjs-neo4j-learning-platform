// src/lib/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not set. Check .env.local");
}

async function parseError(res: Response) {
  try {
    const data = await res.json();
    return JSON.stringify(data);
  } catch {
    return await res.text().catch(() => "");
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errBody = await parseError(res);
    throw new Error(`API ${res.status}: ${errBody}`);
  }

  // ako backend nekad vrati prazan body (npr. delete), ovo sprečava crash
  const text = await res.text();
  return (text ? JSON.parse(text) : (null as any)) as T;
}

// ===== COURSES =====
export const CoursesAPI = {
  getAll: () => api<any[]>("/courses"),
  details: (slug: string) => api<any>(`/courses/${encodeURIComponent(slug)}/details`),
  create: (body: any) => api<any>("/courses/create", { method: "POST", body: JSON.stringify(body) }),

  update: (slug: string, body: any) =>
    api<any>(`/courses/${encodeURIComponent(slug)}`, { method: "PATCH", body: JSON.stringify(body) }),

  remove: (slug: string) =>
    api<boolean>(`/courses/${encodeURIComponent(slug)}`, { method: "DELETE" }),
};

// ===== STUDENTS / USERS =====
export const StudentsAPI = {
  // create student
  create: (body: any) =>
    api<any>("/students/create", { method: "POST", body: JSON.stringify(body) }),

  // enroll / unenroll
  enroll: (body: any) =>
    api<boolean>("/students/enroll", { method: "POST", body: JSON.stringify(body) }),

  unenroll: (body: any) =>
    api<boolean>("/students/unenroll", { method: "POST", body: JSON.stringify(body) }),

  // students for course
  studentsForCourse: (slug: string) =>
    api<any[]>(`/students/course/${encodeURIComponent(slug)}/students`),

  // lists98 
  getAllStudents: () => api<any[]>("/students"),
  getAllInstructors: () => api<any[]>("/students/instructors"),
  getAllAdmins: () => api<any[]>("/students/admins"),

  // roles
  makeInstructor: (body: { username: string }) =>
    api<{ ok: true; username: string }>("/students/make-instructor", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  removeInstructor: (body: { username: string }) =>
    api<{ ok: true; username: string }>("/students/remove-instructor", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  makeAdmin: (body: { username: string }) =>
    api<{ ok: true; username: string }>("/students/make-admin", {
      method: "POST",
      body: JSON.stringify(body),
    }),

    removeAdmin: (body: { username: string }) =>
  api<{ ok: true; username: string }>("/students/remove-admin", {
    method: "POST",
    body: JSON.stringify(body),
  }),

};


