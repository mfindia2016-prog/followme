"use client";

import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export function Logout() {
  const router = useRouter();

  async function handleLogout() {
    const { error } = await supabaseBrowser.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      className="btn secondary"
      onClick={handleLogout}
    >
      Logout
    </button>
  );
}
