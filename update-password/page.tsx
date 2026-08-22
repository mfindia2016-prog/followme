 "use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = supabaseBrowser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => subscription.unsubscribe();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(""); setMessage("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    const { error } = await supabaseBrowser().auth.updateUser({ password });
    setLoading(false);
    if (error) { setError(error.message); return; }

    setMessage("Password updated successfully. Redirecting to login...");
    await supabaseBrowser().auth.signOut();
    setTimeout(() => router.replace("/login"), 1200);
  }

  return (
    <main className="login">
      <form className="loginbox" onSubmit={submit}>
        <div className="brand">MF India CRM</div>
        <div className="tag">Cure with Care</div>
        <h2>Set new password</h2>

        {!ready && <div className="error">This reset link is invalid or expired. Request a new one.</div>}
        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}

        {ready && <>
          <div className="field">
            <label>New Password</label>
            <input className="input" type="password" minLength={6}
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="field" style={{ marginTop: 14 }}>
            <label>Confirm Password</label>
            <input className="input" type="password" minLength={6}
              value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          <button className="btn" style={{ width:"100%", marginTop:18 }} disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </>}
      </form>
    </main>
  );
}
