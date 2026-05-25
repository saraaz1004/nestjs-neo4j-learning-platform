"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CoursesAPI } from "@/lib/api";
import type { Course } from "@/lib/types";
import CourseCard from "@/components/CourseCard"; // putanja po tvom projektu

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    CoursesAPI.getAll()
      .then(setCourses)
      .catch((e) => setError(String(e?.message ?? e)));
  }, []);

  return (
    <main className="container">
      <header className="header">
        <div>
          <h1>Courses</h1>
          <p className="muted">Pregled svih kurseva iz baze.</p>
        </div>

        <Link className="btn" href="/login">Admin</Link>

      </header>

      {error && <p className="error">{error}</p>}

      <section className="grid">
        {courses.map((c) => (
          <CourseCard key={c.slug} course={c} />
        ))}
      </section>
    </main>
  );
}
