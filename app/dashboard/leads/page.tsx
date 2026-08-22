import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

export default async function Leads() {
  const sb = await createClient();

  const { data: leads, error } = await sb
    .from("leads")
    .select(`
      *,
      products(name),
      agent_profiles!leads_assigned_agent_fkey(
        id,
        agent_name,
        mobile_no
      )
    `)
    .order("created_at", { ascending: false });

  const { data: agents } = await sb
    .from("agent_profiles")
    .select("id, agent_name, mobile_no, is_active")
    .eq("is_active", true)
    .order("agent_name");

  if (error) {
    return (
      <main style={{ padding: 30 }}>
        <h1>Leads</h1>

        <p style={{ color: "red" }}>
          Error loading leads: {error.message}
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: 30 }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 25,
          gap: 15,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Lead Management</h1>

          <p style={{ color: "#666", marginTop: 6 }}>
            Manage leads, agents and follow-ups
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link className="btn" href="/dashboard/leads/import">
            Import Excel
          </Link>

          <Link className="btn" href="/dashboard/leads/export">
            Export Excel
          </Link>

          <Link className="btn" href="/dashboard/leads/new">
            + New Lead
          </Link>
        </div>
      </div>

      {/* SUMMARY */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 15,
          marginBottom: 25,
        }}
      >
        <div
          style={{
            padding: 18,
            border: "1px solid #ddd",
            borderRadius: 10,
            background: "#fff",
          }}
        >
          <div style={{ color: "#666" }}>Total Leads</div>

          <strong style={{ fontSize: 26 }}>
            {leads?.length ?? 0}
          </strong>
        </div>

        <div
          style={{
            padding: 18,
            border: "1px solid #ddd",
            borderRadius: 10,
            background: "#fff",
          }}
        >
          <div style={{ color: "#666" }}>Active Agents</div>

          <strong style={{ fontSize: 26 }}>
            {agents?.length ?? 0}
          </strong>
        </div>

        <div
          style={{
            padding: 18,
            border: "1px solid #ddd",
            borderRadius: 10,
            background: "#fff",
          }}
        >
          <div style={{ color: "#666" }}>
            Follow-ups
          </div>

          <strong style={{ fontSize: 26 }}>
            {
              (leads ?? []).filter(
                (lead: any) => lead.next_followup_at
              ).length
            }
          </strong>
        </div>
      </div>

      {/* LEAD TABLE */}
      <div className="tablewrap">
        <table className="table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Company</th>
              <th>Phone</th>
              <th>Product</th>
              <th>Source</th>
              <th>Agent</th>
              <th>Status</th>
              <th>Next Follow-up</th>
              <th>Reminder</th>
            </tr>
          </thead>

          <tbody>
            {(leads ?? []).map((lead: any) => {
              const followup = lead.next_followup_at
                ? new Date(lead.next_followup_at)
                : null;

              const isOverdue =
                followup &&
                followup.getTime() < Date.now();

              return (
                <tr key={lead.id}>
                  {/* CUSTOMER */}
                  <td>
                    <strong>
                      {lead.customer_name ?? "-"}
                    </strong>
                  </td>

                  {/* COMPANY */}
                  <td>
                    {lead.company_name ?? "-"}
                  </td>

                  {/* PHONE */}
                  <td>
                    {lead.phone ?? "-"}
                  </td>

                  {/* PRODUCT */}
                  <td>
                    {lead.products?.name ??
                      lead.product ??
                      "-"}
                  </td>

                  {/* SOURCE */}
                  <td>
                    <span
                      style={{
                        textTransform: "capitalize",
                      }}
                    >
                      {lead.source ?? "manual"}
                    </span>
                  </td>

                  {/* AGENT */}
                  <td>
                    {lead.agent_profiles?.agent_name ??
                      "Unassigned"}
                  </td>

                  {/* STATUS */}
                  <td>
                    <span
                      className={
                        "status " +
                        (lead.status ?? "new")
                      }
                    >
                      {lead.status ?? "new"}
                    </span>
                  </td>

                  {/* FOLLOW-UP */}
                  <td>
                    {followup ? (
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: isOverdue
                              ? "red"
                              : "#222",
                          }}
                        >
                          {followup.toLocaleString(
                            "en-IN"
                          )}
                        </div>

                        {isOverdue && (
                          <small
                            style={{
                              color: "red",
                              fontWeight: 700,
                            }}
                          >
                            OVERDUE
                          </small>
                        )}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* REMINDER */}
                  <td>
                    {lead.reminder_enabled ? (
                      <span
                        style={{
                          color: "green",
                          fontWeight: 600,
                        }}
                      >
                        🔔 ON
                      </span>
                    ) : (
                      <span
                        style={{
                          color: "#777",
                        }}
                      >
                        OFF
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* EMPTY STATE */}
      {(leads ?? []).length === 0 && (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            border: "1px solid #ddd",
            borderRadius: 10,
            marginTop: 20,
            background: "#fff",
          }}
        >
          <h3>No leads found</h3>

          <p style={{ color: "#666" }}>
            Create your first lead or import leads
            from Excel.
          </p>

          <Link
            className="btn"
            href="/dashboard/leads/new"
          >
            + Create Lead
          </Link>
        </div>
      )}
    </main>
  );
}
