"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function updatePassword(e: FormEvent) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabaseBrowser().auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Password updated successfully.");

    setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 1500);
  }

  return (
    <main className="login">
      <form className="loginbox" onSubmit={updatePassword}>
        <div className="brand">MF India CRM</div>

        <div className="tag">Cure with Care</div>

        <h2>Set New Password</h2>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {message && (
          <div className="success">
            {message}
          </div>
        )}

        <div className="field">
          <label>New Password</label>

          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <div
          className="field"
          style={{ marginTop: 14 }}
        >
          <label>Confirm Password</label>

          <input
            className="input"
            type="password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            required
            minLength={6}
          />
        </div>

        <button
          className="btn"
          style={{
            width: "100%",
            marginTop: 18,
          }}
          disabled={loading}
        >
          {loading
            ? "Updating..."
            : "Update Password"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/login")}
          style={{
            width: "100%",
            marginTop: 12,
            background: "transparent",
            border: 0,
            color: "#1769e0",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Back to Login
        </button>
      </form>
    </main>
  );
}
