import Link from "next/link";
import {Logout} from "@/components/logout";

export default function DashboardLayout({children}:{children:React.ReactNode}){
 return <div className="layout"><aside className="sidebar"><div className="brand">MF India</div><div className="tag">Cure with Care · CRM</div>
 <nav className="nav"><Link href="/dashboard">Dashboard</Link><Link href="/dashboard/leads">Leads</Link><Link href="/dashboard/followups">Follow-ups</Link><Link href="/dashboard/products">Products</Link><Link href="/dashboard/agents">Agents</Link></nav>
 </aside><section className="main"><header className="topbar"><b>MF India CRM</b><Logout/></header><main className="content">{children}</main></section></div>
}