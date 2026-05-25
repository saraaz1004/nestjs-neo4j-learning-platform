import Link from "next/link";
import type { Course } from "@/lib/types";

export default function CourseCard({ course }: { course: Course }) {
  const safeSlug = encodeURIComponent(String(course.slug ?? "").trim());

  return (
    <Link href={`/courses/${safeSlug}`} className="card">
      <div className="title">{course.name}</div>
      <div className="muted">{course.slug}</div>

      <p className="desc">
        {course.description
          ? course.description.length > 120
            ? course.description.slice(0, 120) + "..."
            : course.description
          : "Nema opisa."}
      </p>

      <div className="pill">Open</div>
    </Link>
  );
}

