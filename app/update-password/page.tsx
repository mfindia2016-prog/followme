"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function UpdatePasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      // IMPORTANT:
      // supabaseBrowser is already a Supabase client.
      // Do NOT use supabaseBrowser().
      const supabase = supabaseBrowser;

      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        throw updateError;
      }

      setMessage(
        "Password updated successfully."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 1200);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 14,
          padding: 30,
          boxShadow:
            "0 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              color: "#0f172a",
            }}
          >
            Update Password
          </h1>

          <p
            style={{
              marginTop: 8,
              color: "#64748b",
            }}
          >
            Create your new password.
          </p>
        </div>

        {message && (
          <div
            style={{
              marginBottom: 18,
              padding: 12,
              borderRadius: 8,
              background: "#dcfce7",
              border: "1px solid #bbf7d0",
              color: "#166534",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              marginBottom: 18,
              padding: 12,
              borderRadius: 8,
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#991b1b",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div
            style={{
              marginBottom: 18,
            }}
          >
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: 7,
                fontWeight: 600,
                color: "#334155",
              }}
            >
              New Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter new password"
              autoComplete="new-password"
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                borderRadius: 8,
                border:
                  "1px solid #cbd5e1",
                fontSize: 15,
              }}
            />
          </div>

          <div
            style={{
              marginBottom: 22,
            }}
          >
            <label
              htmlFor="confirmPassword"
              style={{
                display: "block",
                marginBottom: 7,
                fontWeight: 600,
                color: "#334155",
              }}
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              placeholder="Confirm new password"
              autoComplete="new-password"
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                borderRadius: 8,
                border:
                  "1px solid #cbd5e1",
                fontSize: 15,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px 16px",
              border: "none",
              borderRadius: 8,
              background: "#111827",
              color: "#fff",
              fontWeight: 600,
              cursor: loading
                ? "not-allowed"
                : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading
              ? "Updating..."
              : "Update Password"}
          </button>
        </form>

        <button
          type="button"
          onClick={() =>
            router.push("/login")
          }
          style={{
            width: "100%",
            marginTop: 15,
            padding: "11px 16px",
            border:
              "1px solid #cbd5e1",
            borderRadius: 8,
            background: "#fff",
            color: "#334155",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ← Back to Login
        </button>
      </div>
    </main>
  );
}
