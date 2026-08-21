import {createClient} from "@/lib/supabase-server";
export default async function Followups(){
 const sb=await createClient(); const {data}=await sb.from("followups").select("*, leads(customer_name,phone)").eq("completed",false).order("scheduled_at");
 return <><h1>Pending Follow-ups</h1><div className="tablewrap"><table className="table"><thead><tr><th>Date/Time</th><th>Customer</th><th>Phone</th><th>Notes</th><th>Outcome</th></tr></thead><tbody>{(data??[]).map((f:any)=><tr key={f.id}><td>{new Date(f.scheduled_at).toLocaleString()}</td><td>{f.leads?.customer_name}</td><td>{f.leads?.phone??"-"}</td><td>{f.notes??"-"}</td><td>{f.outcome??"-"}</td></tr>)}</tbody></table></div></>
}