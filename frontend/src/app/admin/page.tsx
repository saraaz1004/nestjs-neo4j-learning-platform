"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CoursesAPI, StudentsAPI } from "@/lib/api";
import type { CourseDetails, StudentPublic } from "@/lib/types";

type CourseListItem = {
  id?: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
};

export default function AdminPage() {
  // =========================
  // Lists + selection
  // =========================
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");

  // =========================
  // Course details
  // =========================
  const [data, setData] = useState<CourseDetails | null>(null);

  // =========================
  // Messages
  // =========================
  const [error, setError] = useState<string>("");
  const [info, setInfo] = useState<string>("");

  const clearMessages = () => {
    setError("");
    setInfo("");
  };

  // =========================
  // Enroll form
  // =========================
  const [studentUsername, setStudentUsername] = useState<string>("");

  // =========================
  // Create student form
  // =========================
  const [newStudentUsername, setNewStudentUsername] = useState<string>("");
  const [newStudentEmail, setNewStudentEmail] = useState<string>("");
  const [newStudentPassword, setNewStudentPassword] = useState<string>("");

  // =========================
  // Create course form
  // =========================
  const [instructorUsername, setInstructorUsername] = useState<string>("");
  const [newCourseName, setNewCourseName] = useState<string>("");
  const [newCourseSlug, setNewCourseSlug] = useState<string>("");
  const [newCourseDescription, setNewCourseDescription] = useState<string>("");
  const [newCourseImage, setNewCourseImage] = useState<string>("");

  // =========================
  // Edit course form
  // =========================
  const [editName, setEditName] = useState<string>("");
  const [editSlug, setEditSlug] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [editImage, setEditImage] = useState<string>("");

  // =========================
  // Instructor/Admin actions
  // =========================
  const [roleTargetUsername, setRoleTargetUsername] = useState<string>("");

  // =========================
  // Lists of users
  // =========================
  const [allStudents, setAllStudents] = useState<StudentPublic[]>([]);
  const [allInstructors, setAllInstructors] = useState<StudentPublic[]>([]);
  const [allAdmins, setAllAdmins] = useState<StudentPublic[]>([]);

  const hasSelection = useMemo(() => Boolean(selectedSlug), [selectedSlug]);

  // =========================
  // Loaders
  // =========================
  const loadCourses = async () => {
    clearMessages();
    try {
      const list = await CoursesAPI.getAll();
      setCourses(list);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    }
  };

  const loadDetails = async (slug: string) => {
    clearMessages();
    setData(null);
    try {
      const d = await CoursesAPI.details(slug);
      setData(d);

      // napuni edit formu iz details
      setEditName(d?.name ?? "");
      setEditSlug(d?.slug ?? "");
      setEditDescription(d?.description ?? "");
      setEditImage(d?.image ?? "");
    } catch (e: any) {
      setError(String(e?.message ?? e));
    }
  };

  const loadUserLists = async () => {
    try {
      const [s, i, a] = await Promise.all([
        StudentsAPI.getAllStudents(),
        StudentsAPI.getAllInstructors(),
        StudentsAPI.getAllAdmins(),
      ]);
      setAllStudents(s);
      setAllInstructors(i);
      setAllAdmins(a);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    }
  };

  useEffect(() => {
    loadCourses();
    loadUserLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedSlug) loadDetails(selectedSlug);
    else setData(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlug]);

  // =========================
  // Actions
  // =========================

  const onCreateStudent = async () => {
    clearMessages();

    if (!newStudentUsername.trim() || !newStudentEmail.trim() || !newStudentPassword.trim()) {
      setError("Unesi username, email i password (min 6).");
      return;
    }
    if (newStudentPassword.trim().length < 6) {
      setError("Password mora imati najmanje 6 karaktera.");
      return;
    }

    try {
      await StudentsAPI.create({
        username: newStudentUsername.trim(),
        email: newStudentEmail.trim(),
        password: newStudentPassword.trim(),
      });

      setInfo("Student je uspešno kreiran.");
      setNewStudentUsername("");
      setNewStudentEmail("");
      setNewStudentPassword("");

      await loadUserLists();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    }
  };

  const onCreateCourse = async () => {
    clearMessages();

    if (!instructorUsername.trim()) {
      setError("Unesi instructorUsername (mora postojati i biti Instructor).");
      return;
    }
    if (!newCourseName.trim() || !newCourseSlug.trim()) {
      setError("Unesi name i slug za kurs.");
      return;
    }
    if (!newCourseDescription.trim()) {
      setError("Description je obavezan.");
      return;
    }
    if (!newCourseImage.trim()) {
      setError("Image je obavezan.");
      return;
    }

    try {
      await CoursesAPI.create({
        instructorUsername: instructorUsername.trim(),
        name: newCourseName.trim(),
        slug: newCourseSlug.trim(),
        description: newCourseDescription.trim(),
        image: newCourseImage.trim(),
      });

      setInfo(`Kurs je uspešno kreiran: ${newCourseSlug.trim()}`);
      setInstructorUsername("");
      setNewCourseName("");
      setNewCourseSlug("");
      setNewCourseDescription("");
      setNewCourseImage("");

      await loadCourses();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    }
  };

  const onEnroll = async () => {
    if (!selectedSlug) return;
    clearMessages();

    if (!studentUsername.trim()) {
      setError("Unesi username studenta.");
      return;
    }

    try {
      await StudentsAPI.enroll({
        studentUsername: studentUsername.trim(),
        courseSlug: selectedSlug,
      });

      setInfo("Student je upisan na kurs.");
      setStudentUsername("");
      await loadDetails(selectedSlug);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    }
  };

  const onUnenroll = async () => {
    if (!selectedSlug) return;
    clearMessages();

    if (!studentUsername.trim()) {
      setError("Unesi username studenta.");
      return;
    }

    try {
      await StudentsAPI.unenroll({
        studentUsername: studentUsername.trim(),
        courseSlug: selectedSlug,
      });

      setInfo("Student je ispisan sa kursa.");
      setStudentUsername("");
      await loadDetails(selectedSlug);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    }
  };

  const onUpdateCourse = async () => {
    if (!selectedSlug) return;
    clearMessages();

    if (!editName.trim() || !editSlug.trim() || !editDescription.trim() || !editImage.trim()) {
      setError("Popuni sva polja (name, slug, description, image).");
      return;
    }

    try {
      await CoursesAPI.update(selectedSlug, {
        name: editName.trim(),
        slug: editSlug.trim(),
        description: editDescription.trim(),
        image: editImage.trim(),
      });

      setInfo("Kurs je uspešno ažuriran.");

      const newSel = editSlug.trim();
      setSelectedSlug(newSel);

      await loadCourses();
      await loadDetails(newSel);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    }
  };

  const onDeleteCourse = async () => {
    if (!selectedSlug) return;
    clearMessages();

    if (!confirm(`Obrisati kurs: ${selectedSlug}?`)) return;

    try {
      await CoursesAPI.remove(selectedSlug);
      setInfo("Kurs je obrisan.");
      setSelectedSlug("");
      setData(null);
      await loadCourses();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    }
  };

  const onMakeInstructor = async () => {
    clearMessages();
    if (!roleTargetUsername.trim()) {
      setError("Unesi username za make-instructor.");
      return;
    }
    try {
      const res = await StudentsAPI.makeInstructor({ username: roleTargetUsername.trim() });
      setInfo(`OK: ${res.username} je sada Instructor.`);
      setRoleTargetUsername("");
      await loadUserLists();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    }
  };

  const onRemoveInstructor = async () => {
    clearMessages();
    if (!roleTargetUsername.trim()) {
      setError("Unesi username za remove-instructor.");
      return;
    }
    try {
      const res = await StudentsAPI.removeInstructor({ username: roleTargetUsername.trim() });
      setInfo(`OK: ${res.username} više nije Instructor.`);
      setRoleTargetUsername("");
      await loadUserLists();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    }
  };

  const onMakeAdmin = async () => {
    clearMessages();
    if (!roleTargetUsername.trim()) {
      setError("Unesi username za make-admin.");
      return;
    }
    try {
      const res = await StudentsAPI.makeAdmin({ username: roleTargetUsername.trim() });
      setInfo(`OK: ${res.username} je sada Admin.`);
      setRoleTargetUsername("");
      await loadUserLists();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    }
  };

  // ✅ NEW: remove admin (needs backend route)
  const onRemoveAdmin = async () => {
    clearMessages();
    if (!roleTargetUsername.trim()) {
      setError("Unesi username za remove-admin.");
      return;
    }
    try {
      // mora da postoji StudentsAPI.removeAdmin u api.ts (vidi ispod)
      const res = await (StudentsAPI as any).removeAdmin({ username: roleTargetUsername.trim() });
      setInfo(`OK: ${res.username} više nije Admin.`);
      setRoleTargetUsername("");
      await loadUserLists();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <main className="container">
      <header className="header">
        <Link className="btn ghost" href="/">
          ← Back
        </Link>
        <div style={{ flex: 1 }} />
        <button className="btn ghost" onClick={loadCourses}>
          Refresh courses
        </button>
        <button className="btn ghost" onClick={loadUserLists}>
          Refresh users
        </button>
        <button
          className="btn ghost"
          onClick={() => {
            document.cookie = "admin=; path=/; max-age=0";
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </header>

      {error && <p className="error">{error}</p>}
      {info && <p className="muted">{info}</p>}

      {/* CREATE FORMS */}
      <div className="row" style={{ marginTop: 12 }}>
        <div className="panel">
          <h3>Create student</h3>
          <div className="formRow">
            <input
              className="input"
              placeholder="username"
              value={newStudentUsername}
              onChange={(e) => setNewStudentUsername(e.target.value)}
            />
            <input
              className="input"
              placeholder="email"
              value={newStudentEmail}
              onChange={(e) => setNewStudentEmail(e.target.value)}
            />
          </div>
          <div className="formRow" style={{ marginTop: 8 }}>
            <input
              className="input"
              placeholder="password (min 6)"
              type="password"
              value={newStudentPassword}
              onChange={(e) => setNewStudentPassword(e.target.value)}
            />
            <button className="btn" onClick={onCreateStudent}>
              Create
            </button>
          </div>
        </div>

        <div className="panel">
          <h3>Create course</h3>

          <div className="formRow">
            <input
              className="input"
              placeholder="instructorUsername (mora postojati i biti Instructor)"
              value={instructorUsername}
              onChange={(e) => setInstructorUsername(e.target.value)}
            />
            <input
              className="input"
              placeholder="name"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
            />
          </div>

          <div className="formRow" style={{ marginTop: 8 }}>
            <input
              className="input"
              placeholder="slug (npr. web-development)"
              value={newCourseSlug}
              onChange={(e) => setNewCourseSlug(e.target.value)}
            />
            <input
              className="input"
              placeholder="image (URL ili putanja)"
              value={newCourseImage}
              onChange={(e) => setNewCourseImage(e.target.value)}
            />
          </div>

          <div className="formRow" style={{ marginTop: 8 }}>
            <input
              className="input"
              placeholder="description"
              value={newCourseDescription}
              onChange={(e) => setNewCourseDescription(e.target.value)}
            />
            <button className="btn" onClick={onCreateCourse}>
              Create
            </button>
          </div>
        </div>
      </div>

      {/* ROLE ACTIONS */}
      <div className="panel" style={{ marginTop: 12 }}>
        <h3>Roles</h3>
        <p className="muted small">Unesi username i dodeli/ukloni ulogu.</p>
        <div className="formRow">
          <input
            className="input"
            placeholder="username"
            value={roleTargetUsername}
            onChange={(e) => setRoleTargetUsername(e.target.value)}
            style={{ maxWidth: 280 }}
          />
          <button className="btn" onClick={onMakeInstructor}>
            Make Instructor
          </button>
          <button className="btn danger" onClick={onRemoveInstructor}>
            Remove Instructor
          </button>
          <button className="btn" onClick={onMakeAdmin}>
            Make Admin
          </button>
          <button className="btn danger" onClick={onRemoveAdmin}>
            Remove Admin
          </button>
        </div>
      </div>

      {/* COURSE SELECTION */}
      <div className="panel" style={{ marginTop: 12 }}>
        <h3>Course selection</h3>
        <div className="formRow">
          <select
            className="input"
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            style={{ maxWidth: 360 }}
          >
            <option value="" disabled>
              Izaberi kurs…
            </option>
            {courses.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} ({c.slug})
              </option>
            ))}
          </select>

          <button
            className="btn ghost"
            onClick={() => selectedSlug && loadDetails(selectedSlug)}
            disabled={!hasSelection}
          >
            Refresh details
          </button>
        </div>

        {!hasSelection && <p className="muted">Izaberi kurs da bi video detalje.</p>}
      </div>

      {/* DETAILS + ENROLL/UNENROLL + EDIT */}
      {hasSelection && !data ? (
        <p className="muted" style={{ marginTop: 12 }}>
          Loading…
        </p>
      ) : hasSelection && data ? (
        <>
          <div className="card" style={{ marginTop: 12 }}>
            <div className="title" style={{ fontSize: 22 }}>
              {data.name}
            </div>
            <div className="muted">{data.slug}</div>
            <p className="desc">{data.description || "Nema opisa."}</p>
            <div className="pill">{data.studentsCount} students</div>
          </div>

          <div className="row" style={{ marginTop: 12 }}>
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
                <button className="btn" onClick={onEnroll} disabled={!studentUsername.trim()}>
                  Enroll
                </button>
                <button className="btn danger" onClick={onUnenroll} disabled={!studentUsername.trim()}>
                  Unenroll
                </button>
              </div>
            </div>

            <div className="panel">
              <h3>Edit course</h3>
              <p className="muted small">Izmeni podatke kursa i klikni Update.</p>

              <div className="formRow">
                <input className="input" placeholder="name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                <input className="input" placeholder="slug" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} />
              </div>

              <div className="formRow" style={{ marginTop: 8 }}>
                <input className="input" placeholder="image" value={editImage} onChange={(e) => setEditImage(e.target.value)} />
              </div>

              <div className="formRow" style={{ marginTop: 8 }}>
                <input
                  className="input"
                  placeholder="description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <button className="btn" onClick={onUpdateCourse}>
                  Update
                </button>
                <button className="btn danger" onClick={onDeleteCourse}>
                  Delete
                </button>
              </div>
            </div>

            <div className="panel">
              <h3>Students (for selected course)</h3>
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
      ) : null}

      {/* USERS LISTS */}
      <div className="row" style={{ marginTop: 12 }}>
        <div className="panel">
          <h3>All students</h3>
          {allStudents.length === 0 ? (
            <p className="muted">Nema studenata.</p>
          ) : (
            <ul className="list">
              {allStudents.map((u) => (
                <li key={u.username} className="listItem">
                  <div>
                    <div className="title">{u.username}</div>
                    <div className="muted small">{u.email}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel">
          <h3>Instructors</h3>
          {allInstructors.length === 0 ? (
            <p className="muted">Nema instruktora.</p>
          ) : (
            <ul className="list">
              {allInstructors.map((u) => (
                <li key={u.username} className="listItem">
                  <div>
                    <div className="title">{u.username}</div>
                    <div className="muted small">{u.email}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel">
          <h3>Admins</h3>
          {allAdmins.length === 0 ? (
            <p className="muted">Nema admina.</p>
          ) : (
            <ul className="list">
              {allAdmins.map((u) => (
                <li key={u.username} className="listItem">
                  <div>
                    <div className="title">{u.username}</div>
                    <div className="muted small">{u.email}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
