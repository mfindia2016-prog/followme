import {createClient} from "@/lib/supabase-server";
export default async function Agents(){
 const sb=await createClient(); const {data}=await sb.from("profiles").select("id,full_name,email,role,active,last_login_at").order("full_name");
 return <><h1>Agent Management</h1><div className="tablewrap"><table className="table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Active</th><th>Last Login</th></tr></thead><tbody>{(data??[]).map((a:any)=><tr key={a.id}><td>{a.full_name}</td><td>{a.email??"-"}</td><td>{a.role}</td><td>{a.active?"Yes":"No"}</td><td>{a.last_login_at?new Date(a.last_login_at).toLocaleString():"-"}</td></tr>)}</tbody></table></div></>
}