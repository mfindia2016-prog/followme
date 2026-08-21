"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const router = useRouter();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { error } =
      await supabaseBrowser().auth.signInWithPassword({
        email,
        password,
      });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function sendReset(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!resetEmail) {
      setError("Please enter your email address.");
      return;
    }

    setResetLoading(true);

    const { error } =
      await supabaseBrowser().auth.resetPasswordForEmail(
        resetEmail,
        {
          redirectTo:
            `${window.location.origin}/update-password`,
        }
      );

    setResetLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage(
      "Password reset email sent. Check your inbox and spam folder."
    );
  }

  return (
    <main className="login">
      <form
        className="loginbox"
        onSubmit={showReset ? sendReset : submit}
      >
        <div className="brand">MF India CRM</div>
        <div className="tag">Cure with Care</div>

        <h2>{showReset ? "Reset password" : "Sign in"}</h2>

        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}

        <div className="field">
          <label>Email</label>
          <input
            className="input"
            type="email"
            value={showReset ? resetEmail : email}
            onChange={(e) =>
              showReset
                ? setResetEmail(e.target.value)
                : setEmail(e.target.value)
            }
            required
          />
        </div>

        {!showReset && (
          <div className="field" style={{ marginTop: 14 }}>
            <label>Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        )}

        <button
          className="btn"
          style={{ width: "100%", marginTop: 18 }}
          disabled={loading || resetLoading}
        >
          {showReset
            ? resetLoading
              ? "Sending..."
              : "Send Reset Link"
            : loading
              ? "Signing in..."
              : "Login"}
        </button>

        <button
          type="button"
          onClick={() => {
            setShowReset(!showReset);
            setError("");
            setMessage("");
            setResetEmail(email);
          }}
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
          {showReset ? "Back to Login" : "Forgot Password?"}
        </button>
      </form>
    </main>
  );
}
