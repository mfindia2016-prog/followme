import {createClient} from "@/lib/supabase-server";
export default async function Products(){
 const sb=await createClient(); const {data}=await sb.from("products").select("*").order("name");
 return <><h1>Product Master</h1><div className="tablewrap"><table className="table"><thead><tr><th>Name</th><th>Category</th><th>SKU</th><th>Active</th></tr></thead><tbody>{(data??[]).map((p:any)=><tr key={p.id}><td>{p.name}</td><td>{p.category??"-"}</td><td>{p.sku??"-"}</td><td>{p.active?"Yes":"No"}</td></tr>)}</tbody></table></div></>
}