"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const supabase = supabaseBrowser();

      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError("Unable to sign in. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login">
      <form className="loginbox" onSubmit={handleLogin}>
        <div className="brand">MF India CRM</div>

        <div className="tag">Cure with Care</div>

        <h2>Sign in</h2>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <div className="field">
          <label>Email</label>

          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div
          className="field"
          style={{ marginTop: 14 }}
        >
          <label>Password</label>

          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn"
          style={{
            width: "100%",
            marginTop: 18,
          }}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/forgot-password")}
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
          Forgot Password?
        </button>
      </form>
    </main>
  );
}
