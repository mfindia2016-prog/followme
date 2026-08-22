import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

function getFollowupDate(lead: any) {
  if (lead.next_followup_at) {
    const date = new Date(lead.next_followup_at);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  if (lead.next_follow_up_date) {
    const time = lead.next_follow_up_time || "09:00";

    const date = new Date(
      `${lead.next_follow_up_date}T${time}:00`
    );

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}

function getRemarks(lead: any) {
  return (
    lead.remarks?.trim() ||
    lead.notes?.trim() ||
    "-"
  );
}

function formatDate(date: Date | null) {
  if (!date) return "-";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function FollowupTable({
  title,
  leads,
  agentMap,
}: {
  title: string;
  leads: any[];
  agentMap: Map<string, string>;
}) {
  return (
    <div
      className="card"
      style={{
        marginBottom: 25,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "18px 20px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <h2 style={{ margin: 0 }}>{title}</h2>

        <p
          style={{
            margin: "5px 0 0",
            color: "#64748b",
          }}
        >
          {leads.length} follow-up
          {leads.length === 1 ? "" : "s"}
        </p>
      </div>

      {leads.length === 0 ? (
        <div
          style={{
            padding: 30,
            textAlign: "center",
            color: "#64748b",
          }}
        >
          No follow-ups found.
        </div>
      ) : (
        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 1200,
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f8fafc",
                  textAlign: "left",
                }}
              >
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Company</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Product</th>
                <th style={thStyle}>Agent</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Follow-up</th>
                <th style={thStyle}>Last Remarks</th>
                <th style={thStyle}>Reminder</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead: any) => {
                const followup = getFollowupDate(lead);

                const agentName = lead.assigned_agent
                  ? agentMap.get(lead.assigned_agent) ??
                    "Unknown Agent"
                  : lead.assigned_agent_id
                  ? agentMap.get(lead.assigned_agent_id) ??
                    "Unknown Agent"
                  : "Unassigned";

                const remarks = getRemarks(lead);

                return (
                  <tr key={lead.id}>
                    <td style={tdStyle}>
                      <strong>
                        {lead.customer_name ?? "-"}
                      </strong>
                    </td>

                    <td style={tdStyle}>
                      {lead.company_name ?? "-"}
                    </td>

                    <td style={tdStyle}>
                      {lead.phone ??
                        lead.contact_no ??
                        "-"}
                    </td>

                    <td style={tdStyle}>
                      {lead.product ?? "-"}
                    </td>

                    <td style={tdStyle}>
                      <strong>{agentName}</strong>
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "5px 10px",
                          borderRadius: 20,
                          background:
                            lead.status === "followup"
                              ? "#fef3c7"
                              : "#dbeafe",
                          color:
                            lead.status === "followup"
                              ? "#92400e"
                              : "#1d4ed8",
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        {lead.status ??
                          lead.lead_status ??
                          "new"}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      <strong>
                        {formatDate(followup)}
                      </strong>
                    </td>

                    <td
                      style={{
                        ...tdStyle,
                        maxWidth: 300,
                        whiteSpace: "normal",
                      }}
                    >
                      <div
                        style={{
                          lineHeight: 1.5,
                          color:
                            remarks === "-"
                              ? "#94a3b8"
                              : "#334155",
                        }}
                      >
                        {remarks}
                      </div>
                    </td>

                    <td style={tdStyle}>
                      {lead.reminder_enabled ? (
                        <span
                          style={{
                            color: "#16a34a",
                            fontWeight: 700,
                          }}
                        >
                          🔔 ON
                        </span>
                      ) : (
                        <span
                          style={{
                            color: "#94a3b8",
                          }}
                        >
                          OFF
                        </span>
                      )}
                    </td>

                    <td style={tdStyle}>
                      <Link
                        href={`/dashboard/leads/${lead.id}/edit`}
                        className="btn"
                        style={{
                          display: "inline-block",
                          textDecoration: "none",
                          padding: "8px 14px",
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
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "14px 16px",
  fontWeight: 700,
  color: "#0f172a",
  borderBottom: "1px solid #e2e8f0",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderBottom: "1px solid #e2e8f0",
  color: "#1e293b",
  verticalAlign: "top",
};

export default async function FollowupsPage() {
  const sb = await createClient();

  const { data: leads, error: leadsError } = await sb
    .from("leads")
    .select("*")
    .not("next_followup_at", "is", null)
    .order("next_followup_at", {
      ascending: true,
    });

  const { data: agents, error: agentsError } = await sb
    .from("agent_profiles")
    .select("id, agent_name")
    .order("agent_name", {
      ascending: true,
    });

  if (leadsError) {
    return (
      <main style={{ padding: 30 }}>
        <h1>Follow-ups</h1>

        <div
          style={{
            padding: 15,
            marginTop: 20,
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: 8,
          }}
        >
          Error loading follow-ups:{" "}
          {leadsError.message}
        </div>
      </main>
    );
  }

  if (agentsError) {
    return (
      <main style={{ padding: 30 }}>
        <h1>Follow-ups</h1>

        <div
          style={{
            padding: 15,
            marginTop: 20,
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: 8,
          }}
        >
          Error loading agents:{" "}
          {agentsError.message}
        </div>
      </main>
    );
  }

  const agentMap = new Map(
    (agents ?? []).map((agent: any) => [
      agent.id,
      agent.agent_name,
    ])
  );

  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const today: any[] = [];
  const upcoming: any[] = [];
  const overdue: any[] = [];

  for (const lead of leads ?? []) {
    const date = getFollowupDate(lead);

    if (!date) continue;

    if (date < startOfToday) {
      overdue.push(lead);
    } else if (
      date >= startOfToday &&
      date <= endOfToday
    ) {
      today.push(lead);
    } else {
      upcoming.push(lead);
    }
  }

  return (
    <main style={{ padding: 30 }}>
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 15,
          marginBottom: 30,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>
            Follow-ups
          </h1>

          <p
            style={{
              marginTop: 6,
              color: "#64748b",
            }}
          >
            Manage today's, upcoming and overdue
            follow-ups
          </p>
        </div>

        <Link
          href="/dashboard/leads"
          className="btn"
          style={{
            textDecoration: "none",
          }}
        >
          ← All Leads
        </Link>
      </div>

      {/* SUMMARY */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 15,
          marginBottom: 30,
        }}
      >
        <SummaryCard
          title="Today"
          value={today.length}
        />

        <SummaryCard
          title="Upcoming"
          value={upcoming.length}
        />

        <SummaryCard
          title="Overdue"
          value={overdue.length}
        />

        <SummaryCard
          title="Total Follow-ups"
          value={
            today.length +
            upcoming.length +
            overdue.length
          }
        />
      </div>

      {/* TODAY */}

      <FollowupTable
        title="Today's Follow-ups"
        leads={today}
        agentMap={agentMap}
      />

      {/* UPCOMING */}

      <FollowupTable
        title="Upcoming Follow-ups"
        leads={upcoming}
        agentMap={agentMap}
      />

      {/* OVERDUE */}

      <FollowupTable
        title="Overdue Follow-ups"
        leads={overdue}
        agentMap={agentMap}
      />
    </main>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div
      style={{
        padding: 20,
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        background: "#fff",
      }}
    >
      <div
        style={{
          color: "#64748b",
          marginBottom: 5,
        }}
      >
        {title}
      </div>

      <strong
        style={{
          fontSize: 28,
          color: "#0f172a",
        }}
      >
        {value}
      </strong>
    </div>
  );
}
