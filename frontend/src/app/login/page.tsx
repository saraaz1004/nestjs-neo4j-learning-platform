"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [err, setErr] = useState("");

  const onLogin = () => {
    setErr("");
    const expected = process.env.NEXT_PUBLIC_ADMIN_KEY;

    if (!expected) {
      setErr("NEXT_PUBLIC_ADMIN_KEY nije podešen u .env.local");
      return;
    }

    if (key.trim() !== expected) {
      setErr("Pogrešna šifra.");
      return;
    }

    // cookie (radi jednostavno bez biblioteka)
    document.cookie = `admin=1; path=/; max-age=${60 * 60 * 6}`; // 6h
    router.push("/admin");
  };

  return (
    <main className="container">
      <h1>Admin login</h1>
      <p className="muted">Unesi admin šifru da pristupiš /admin.</p>

      {err && <p className="error">{err}</p>}

      <div className="panel" style={{ maxWidth: 420 }}>
        <input
          className="input"
          placeholder="Admin key"
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <button className="btn" style={{ marginTop: 10 }} onClick={onLogin}>
          Login
        </button>
      </div>
    </main>
  );
}
