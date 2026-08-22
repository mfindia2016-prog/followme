import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

type Lead = {
  id: string;
  customer_name: string | null;
  company_name: string | null;
  phone: string | null;
  contact_no: string | null;
  product: string | null;
  source: string | null;
  assigned_agent: string | null;
  assigned_agent_id: string | null;
  status: string | null;
  lead_status: string | null;
  remarks: string | null;
  notes: string | null;
  next_followup_at: string | null;
  next_follow_up_date: string | null;
  next_follow_up_time: string | null;
  reminder_enabled: boolean | null;
};

type Agent = {
  id: string;
  agent_name: string;
};

function getFollowupDate(lead: Lead): Date | null {
  // First use the combined timestamp
  if (lead.next_followup_at) {
    const date = new Date(lead.next_followup_at);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  // Fallback to separate date + time
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

function getLastRemarks(lead: Lead) {
  return (
    lead.remarks?.trim() ||
    lead.notes?.trim() ||
    "-"
  );
}

function formatFollowupDate(date: Date | null) {
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

function getAgentName(
  lead: Lead,
  agentMap: Map<string, string>
) {
  const agentId =
    lead.assigned_agent ||
    lead.assigned_agent_id;

  if (!agentId) {
    return "Unassigned";
  }

  return agentMap.get(agentId) || "Unknown Agent";
}

const thStyle: React.CSSProperties = {
  padding: "14px 16px",
  textAlign: "left",
  fontWeight: 700,
  color: "#0f172a",
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderBottom: "1px solid #e2e8f0",
  verticalAlign: "top",
};

function FollowupTable({
  title,
  leads,
  agentMap,
}: {
  title: string;
  leads: Lead[];
  agentMap: Map<string, string>;
}) {
  return (
    <div
      className="card"
      style={{
        padding: 0,
        marginBottom: 25,
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
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: 1250,
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
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
              {leads.map((lead) => {
                const followupDate =
                  getFollowupDate(lead);

                const remarks =
                  getLastRemarks(lead);

                const agentName =
                  getAgentName(
                    lead,
                    agentMap
                  );

                return (
                  <tr key={lead.id}>
                    <td style={tdStyle}>
                      <strong>
                        {lead.customer_name ||
                          "-"}
                      </strong>
                    </td>

                    <td style={tdStyle}>
                      {lead.company_name ||
                        "-"}
                    </td>

                    <td style={tdStyle}>
                      {lead.phone ||
                        lead.contact_no ||
                        "-"}
                    </td>

                    <td style={tdStyle}>
                      {lead.product || "-"}
                    </td>

                    <td style={tdStyle}>
                      <strong>
                        {agentName}
                      </strong>
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          display:
                            "inline-block",
                          padding:
                            "5px 10px",
                          borderRadius: 20,
                          background:
                            lead.status ===
                            "followup"
                              ? "#fef3c7"
                              : "#dbeafe",
                          color:
                            lead.status ===
                            "followup"
                              ? "#92400e"
                              : "#1d4ed8",
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        {lead.status ||
                          lead.lead_status ||
                          "new"}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      <strong
                        style={{
                          color:
                            followupDate &&
                            followupDate.getTime() <
                              Date.now()
                              ? "#dc2626"
                              : "#0f172a",
                        }}
                      >
                        {formatFollowupDate(
                          followupDate
                        )}
                      </strong>

                      {followupDate &&
                        followupDate.getTime() <
                          Date.now() && (
                          <div
                            style={{
                              marginTop: 4,
                              color:
                                "#dc2626",
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            OVERDUE
                          </div>
                        )}
                    </td>

                    <td
                      style={{
                        ...tdStyle,
                        maxWidth: 320,
                        minWidth: 220,
                      }}
                    >
                      <div
                        style={{
                          whiteSpace:
                            "pre-wrap",
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
                            color:
                              "#16a34a",
                            fontWeight: 700,
                          }}
                        >
                          🔔 ON
                        </span>
                      ) : (
                        <span
                          style={{
                            color:
                              "#94a3b8",
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
                          display:
                            "inline-block",
                          textDecoration:
                            "none",
                          padding:
                            "8px 14px",
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
        border:
          "1px solid #e2e8f0",
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

export default async function FollowupsPage() {
  const sb = await createClient();

  // Load ALL leads first.
  // We do NOT filter only next_followup_at here,
  // because some leads may use date/time columns.
  const {
    data: leadData,
    error: leadsError,
  } = await sb
    .from("leads")
    .select(`
      id,
      customer_name,
      company_name,
      phone,
      contact_no,
      product,
      source,
      assigned_agent,
      assigned_agent_id,
      status,
      lead_status,
      remarks,
      notes,
      next_followup_at,
      next_follow_up_date,
      next_follow_up_time,
      reminder_enabled
    `)
    .order("created_at", {
      ascending: false,
    });

  if (leadsError) {
    return (
      <main style={{ padding: 30 }}>
        <h1>Follow-ups</h1>

        <div
          style={{
            marginTop: 20,
            padding: 20,
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: 10,
          }}
        >
          <strong>
            Error loading follow-ups
          </strong>

          <p>
            {leadsError.message}
          </p>
        </div>
      </main>
    );
  }

  const leads = (leadData ||
    []) as Lead[];

  // Load agents
  const {
    data: agentData,
    error: agentsError,
  } = await sb
    .from("agent_profiles")
    .select(
      "id, agent_name"
    )
    .order("agent_name", {
      ascending: true,
    });

  if (agentsError) {
    return (
      <main style={{ padding: 30 }}>
        <h1>Follow-ups</h1>

        <div
          style={{
            marginTop: 20,
            padding: 20,
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: 10,
          }}
        >
          <strong>
            Error loading agents
          </strong>

          <p>
            {agentsError.message}
          </p>
        </div>
      </main>
    );
  }

  const agentMap =
    new Map<string, string>(
      (agentData || []).map(
        (agent: Agent) => [
          agent.id,
          agent.agent_name,
        ]
      )
    );

  const now = new Date();

  const startOfToday =
    new Date(now);

  startOfToday.setHours(
    0,
    0,
    0,
    0
  );

  const endOfToday =
    new Date(now);

  endOfToday.setHours(
    23,
    59,
    59,
    999
  );

  const today: Lead[] = [];
  const upcoming: Lead[] = [];
  const overdue: Lead[] = [];

  for (const lead of leads) {
    const date =
      getFollowupDate(lead);

    // No follow-up date = don't show
    if (!date) continue;

    if (
      date.getTime() <
      startOfToday.getTime()
    ) {
      overdue.push(lead);
    } else if (
      date.getTime() >=
        startOfToday.getTime() &&
      date.getTime() <=
        endOfToday.getTime()
    ) {
      today.push(lead);
    } else {
      upcoming.push(lead);
    }
  }

  // Sort by follow-up date
  const sortByDate = (
    a: Lead,
    b: Lead
  ) => {
    const dateA =
      getFollowupDate(a)?.getTime() ??
      0;

    const dateB =
      getFollowupDate(b)?.getTime() ??
      0;

    return dateA - dateB;
  };

  today.sort(sortByDate);
  upcoming.sort(sortByDate);
  overdue.sort(sortByDate);

  const totalFollowups =
    today.length +
    upcoming.length +
    overdue.length;

  return (
    <main style={{ padding: 30 }}>
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
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
            Manage today's,
            upcoming and overdue
            follow-ups
          </p>
        </div>

        <Link
          href="/dashboard/leads"
          className="btn"
          style={{
            textDecoration:
              "none",
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
          value={totalFollowups}
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
