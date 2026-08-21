 "use client";
import {useRouter} from "next/navigation"; import {supabaseBrowser} from "@/lib/supabase-browser";
export function Logout(){const r=useRouter(); return <button className="btn secondary" onClick={async()=>{await supabaseBrowser().auth.signOut();r.push("/login");}}>Logout</button>}