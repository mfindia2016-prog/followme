 "use client";
import {FormEvent,useEffect,useState} from "react"; import {useRouter} from "next/navigation"; import {supabaseBrowser} from "@/lib/supabase-browser";
export default function NewLead(){
 const [products,setProducts]=useState<any[]>([]); const [agents,setAgents]=useState<any[]>([]); const [error,setError]=useState(""); const r=useRouter();
 useEffect(()=>{const s=supabaseBrowser(); Promise.all([s.from("products").select("id,name").eq("active",true).order("name"),s.from("profiles").select("id,full_name").eq("active",true).order("full_name")]).then(([p,a])=>{setProducts(p.data??[]);setAgents(a.data??[])})},[]);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setError("");const f=new FormData(e.currentTarget);const s=supabaseBrowser();
 const {error}=await s.from("leads").insert({customer_name:f.get("customer_name"),company_name:f.get("company_name")||null,phone:f.get("phone")||null,email:f.get("email")||null,product_id:f.get("product_id")||null,assigned_agent:f.get("assigned_agent")||null,status:f.get("status"),source:f.get("source")||null,remarks:f.get("remarks")||null,next_followup_at:f.get("next_followup_at")?new Date(String(f.get("next_followup_at"))).toISOString():null});
 if(error){setError(error.message);return} r.push("/dashboard/leads");r.refresh();}
 return <><h1>New Lead</h1>{error&&<div className="error">{error}</div>}<form className="card" onSubmit={submit}><div className="formgrid">
 {["customer_name","company_name","phone","email","source"].map(n=><div className="field" key={n}><label>{n.replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase())}</label><input name={n} className="input"/></div>)}
 <div className="field"><label>Product</label><select name="product_id" className="select"><option value="">Select product</option>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
 <div className="field"><label>Agent</label><select name="assigned_agent" className="select"><option value="">Unassigned</option>{agents.map(a=><option key={a.id} value={a.id}>{a.full_name}</option>)}</select></div>
 <div className="field"><label>Status</label><select name="status" className="select"><option value="new">New</option><option value="followup">Follow-up</option><option value="won">Won</option><option value="lost">Lost</option></select></div>
 <div className="field"><label>Next Follow-up</label><input name="next_followup_at" type="datetime-local" className="input"/></div>
 <div className="field full"><label>Remarks</label><textarea name="remarks" className="textarea" rows={4}/></div>
 </div><button className="btn" style={{marginTop:18}}>Save Lead</button></form></>
}