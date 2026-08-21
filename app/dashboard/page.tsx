import {createClient} from "@/lib/supabase-server";
import Link from "next/link";

export default async function Dashboard(){
 const sb=await createClient();
 const [{count:leads},{count:followups},{count:today},{count:products}]=await Promise.all([
   sb.from("leads").select("*",{count:"exact",head:true}),
   sb.from("followups").select("*",{count:"exact",head:true}).eq("completed",false),
   sb.from("followups").select("*",{count:"exact",head:true}).eq("completed",false).gte("scheduled_at",new Date(new Date().setHours(0,0,0,0)).toISOString()).lt("scheduled_at",new Date(new Date().setHours(24,0,0,0)).toISOString()),
   sb.from("products").select("*",{count:"exact",head:true}).eq("active",true)
 ]);
 return <><h1>Dashboard</h1><div className="grid">
 <div className="card"><div className="label">Total Leads</div><div className="metric">{leads??0}</div></div>
 <div className="card"><div className="label">Pending Follow-ups</div><div className="metric">{followups??0}</div></div>
 <div className="card"><div className="label">Today's Follow-ups</div><div className="metric">{today??0}</div></div>
 <div className="card"><div className="label">Active Products</div><div className="metric">{products??0}</div></div>
 </div><div className="card" style={{marginTop:20}}><h3>Quick actions</h3><div className="toolbar"><Link className="btn" href="/dashboard/leads/new">+ New Lead</Link><Link className="btn secondary" href="/dashboard/followups">Open Follow-ups</Link></div></div></>
}