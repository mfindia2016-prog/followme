import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

export default async function Leads() {
  const sb = await createClient();

  const { data: leads, error: leadsError } = await sb
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: agents, error: agentsError } = await sb
    .from("agent_profiles")
    .select("id, agent_name, is_active")
    .eq("is_active", true)
    .order("agent_name");

  if (leadsError) {
    return (
      <main style={{ padding: 30 }}>
        <h1>Lead Management</h1>
        <p style={{ color: "red" }}>
          Error loading leads: {leadsError.message}
        </p>
      </main>
    );
  }

  if (agentsError) {
    return (
      <main style={{ padding: 30 }}>
        <h1>Lead Management</h1>
        <p style={{ color: "red" }}>
          Error loading agents: {agentsError.message}
        </p>
      </main>
    );
  }

  const agentMap = new Map(
    (agents ?? []).map((agent: any) => [
      agent.id,
      agent.agent_name,
    ])
  );

  const followupCount = (leads ?? []).filter(
    (lead: any) =>
      lead.next_followup_at ||
      lead.next_follow_up_date
  ).length;

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
          <h1 style={{ margin: 0 }}>
            Lead Management
          </h1>

          <p
            style={{
              color: "#666",
              marginTop: 6,
              marginBottom: 0,
            }}
          >
            Manage leads, products, agents and follow-ups
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <Link
            className="btn"
            href="/dashboard/leads/import"
          >
            Import Excel
          </Link>

          <Link
            className="btn"
            href="/dashboard/leads/export"
          >
            Export Excel
          </Link>

          <Link
            className="btn"
            href="/dashboard/leads/new"
          >
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
          <div style={{ color: "#666" }}>
            Total Leads
          </div>

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
          <div style={{ color: "#666" }}>
            Active Agents
          </div>

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
            {followupCount}
          </strong>
        </div>
      </div>

      {/* TABLE */}
      <div
        className="tablewrap"
        style={{
          overflowX: "auto",
        }}
      >
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
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {(leads ?? []).map((lead: any) => {

              let followup: Date | null = null;

              if (lead.next_followup_at) {
                followup = new Date(
                  lead.next_followup_at
                );
              } else if (
                lead.next_follow_up_date
              ) {
                const time =
                  lead.next_follow_up_time ||
                  "09:00:00";

                followup = new Date(
                  `${lead.next_follow_up_date}T${time}`
                );
              }

              const isOverdue =
                followup !== null &&
                followup.getTime() < Date.now();

              const agentId =
                lead.assigned_agent_id ||
                lead.assigned_agent;

              const agentName = agentId
                ? agentMap.get(agentId) ??
                  "Unknown Agent"
                : "Unassigned";

              const currentStatus =
                lead.lead_status ||
                lead.status ||
                "new";

              return (
                <tr key={lead.id}>

                  {/* CUSTOMER */}
                  <td>
                    <strong>
                      {lead.customer_name || "-"}
                    </strong>
                  </td>

                  {/* COMPANY */}
                  <td>
                    {lead.company_name || "-"}
                  </td>

                  {/* PHONE */}
                  <td>
                    {lead.phone ||
                      lead.contact_no ||
                      "-"}
                  </td>

                  {/* PRODUCT */}
                  <td>
                    <strong>
                      {lead.product ||
                        lead.product_requirement ||
                        "-"}
                    </strong>
                  </td>

                  {/* SOURCE */}
                  <td>
                    {lead.source || "Manual"}
                  </td>

                  {/* AGENT */}
                  <td>
                    <strong>
                      {agentName}
                    </strong>
                  </td>

                  {/* STATUS */}
                  <td>
                    <span
                      className={
                        "status " +
                        currentStatus
                      }
                    >
                      {currentStatus}
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
                    {lead.reminder_enabled !== false ? (
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

                  {/* EDIT */}
                  <td>
                    <Link
                      href={`/dashboard/leads/${lead.id}/edit`}
                      className="btn"
                      style={{
                        display: "inline-block",
                        padding:
                          "7px 14px",
                        fontSize: 14,
                        textDecoration:
                          "none",
                      }}
                    >
                      Edit
                    </Link>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* EMPTY */}
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
