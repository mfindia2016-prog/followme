"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      // IMPORTANT:
      // supabaseBrowser is already a Supabase client.
      // Do NOT use supabaseBrowser().
      const supabase = supabaseBrowser;

      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        throw loginError;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please check your email and password."
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
        {/* HEADER */}

        <div
          style={{
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 30,
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            MF India CRM
          </h1>

          <p
            style={{
              marginTop: 8,
              color: "#64748b",
            }}
          >
            Sign in to your account
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div
            style={{
              marginBottom: 18,
              padding: 12,
              borderRadius: 8,
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {/* FORM */}

        <form onSubmit={handleLogin}>
          {/* EMAIL */}

          <div
            style={{
              marginBottom: 18,
            }}
          >
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: 7,
                fontWeight: 600,
                color: "#334155",
              }}
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email"
              autoComplete="email"
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                outline: "none",
                fontSize: 15,
              }}
            />
          </div>

          {/* PASSWORD */}

          <div
            style={{
              marginBottom: 10,
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
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                outline: "none",
                fontSize: 15,
              }}
            />
          </div>

          {/* FORGOT PASSWORD */}

          <div
            style={{
              textAlign: "right",
              marginBottom: 22,
            }}
          >
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/forgot-password"
                )
              }
              style={{
                border: "none",
                background: "transparent",
                color: "#2563eb",
                cursor: "pointer",
                fontSize: 14,
                padding: 0,
              }}
            >
              Forgot Password?
            </button>
          </div>

          {/* LOGIN */}

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
              fontSize: 15,
              cursor: loading
                ? "not-allowed"
                : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
