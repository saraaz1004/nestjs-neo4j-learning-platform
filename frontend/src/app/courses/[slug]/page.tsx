"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CoursesAPI, StudentsAPI } from "@/lib/api";
import type { CourseDetails } from "@/lib/types";

export default function CoursePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [data, setData] = useState<CourseDetails | null>(null);
  const [error, setError] = useState("");
  const [studentUsername, setStudentUsername] = useState("");

  const load = async () => {
    if (!slug) return;
    setError("");
    setData(null);

    try {
      const d = await CoursesAPI.details(String(slug));
      setData(d);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const onEnroll = async () => {
    if (!slug) return;
    setError("");
    try {
      await StudentsAPI.enroll({ studentUsername, courseSlug: String(slug) });
      setStudentUsername("");
      await load();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    }
  };

  const onUnenroll = async () => {
    if (!slug) return;
    setError("");
    try {
      await StudentsAPI.unenroll({ studentUsername, courseSlug: String(slug) });
      setStudentUsername("");
      await load();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    }
  };

  return (
    <main className="container">
      <header className="header">
        <Link className="btn ghost" href="/">
          ← Back
        </Link>
        <div style={{ flex: 1 }} />
        <button className="btn ghost" onClick={load}>
          Refresh
        </button>
      </header>

      {error && <p className="error">{error}</p>}

      {!data ? (
        <p className="muted">Loading…</p>
      ) : (
        <>
          <div className="card">
            <div className="title" style={{ fontSize: 22 }}>
              {data.name}
            </div>
            <div className="muted">{data.slug}</div>
            <p className="desc">{data.description || "Nema opisa."}</p>
            <div className="pill">{data.studentsCount} students</div>
          </div>

          <div className="row">
            <div className="panel">
              <h3>Enroll / Unenroll</h3>
              <p className="muted small">Upiši username studenta.</p>

              <div className="formRow">
                <input
                  className="input"
                  placeholder="studentUsername"
                  value={studentUsername}
                  onChange={(e) => setStudentUsername(e.target.value)}
                />
                <button className="btn" onClick={onEnroll} disabled={!studentUsername}>
                  Enroll
                </button>
                <button className="btn danger" onClick={onUnenroll} disabled={!studentUsername}>
                  Unenroll
                </button>
              </div>
            </div>

            <div className="panel">
              <h3>Students</h3>
              {data.students?.length === 0 ? (
                <p className="muted">Nema upisanih studenata.</p>
              ) : (
                <ul className="list">
                  {data.students.map((s) => (
                    <li key={s.username} className="listItem">
                      <div>
                        <div className="title">{s.username}</div>
                        <div className="muted small">{s.email}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
