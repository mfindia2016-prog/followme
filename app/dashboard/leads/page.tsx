import Link from "next/link";
import {createClient} from "@/lib/supabase-server";
export default async function Leads(){
 const sb=await createClient(); const {data}=await sb.from("leads").select("*, products(name)").order("created_at",{ascending:false});
 return <><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h1>Leads</h1><Link className="btn" href="/dashboard/leads/new">+ New Lead</Link></div>
 <div className="tablewrap"><table className="table"><thead><tr><th>Customer</th><th>Company</th><th>Phone</th><th>Product</th><th>Agent</th><th>Status</th><th>Next Follow-up</th></tr></thead><tbody>
 {(data??[]).map((l:any)=><tr key={l.id}><td>{l.customer_name}</td><td>{l.company_name??"-"}</td><td>{l.phone??"-"}</td><td>{l.products?.name??"-"}</td><td>{l.assigned_agent??"-"}</td><td><span className={"status "+l.status}>{l.status}</span></td><td>{l.next_followup_at?new Date(l.next_followup_at).toLocaleString():"-"}</td></tr>)}
 </tbody></table></div></>
}