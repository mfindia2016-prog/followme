 "use client";
import {FormEvent, useState} from "react";
import {useRouter} from "next/navigation";
import {supabaseBrowser} from "@/lib/supabase-browser";

export default function Login(){
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  const router=useRouter();
  async function submit(e:FormEvent){e.preventDefault();setError("");setLoading(true);
    const {error}=await supabaseBrowser().auth.signInWithPassword({email,password});
    setLoading(false); if(error){setError(error.message);return} router.push("/dashboard"); router.refresh();
  }
  return <main className="login"><form className="loginbox" onSubmit={submit}>
    <div className="brand">MF India CRM</div><div className="tag">Cure with Care</div>
    <h2>Sign in</h2>{error&&<div className="error">{error}</div>}
    <div className="field"><label>Email</label><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
    <div className="field" style={{marginTop:14}}><label>Password</label><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
    <button className="btn" style={{width:"100%",marginTop:18}} disabled={loading}>{loading?"Signing in...":"Login"}</button>
  </form></main>
}