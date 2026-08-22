import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

type Lead = {
  id: string;
  customer_name: string;
  company_name: string | null;
  phone: string | null;
  contact_no: string | null;
  product: string | null;
  source: string | null;
  assigned_agent: string | null;
  assigned_agent_id: string | null;
  status: string | null;
  lead_status: string | null;
  next_followup_at: string | null;
  next_follow_up_date: string | null;
  next_follow_up_time: string | null;
  reminder_enabled: boolean | null;
  created_at: string;
};

type Agent = {
  id: string;
  agent_name: string;
  is_active: boolean | null;
};

export default async function Leads() {
  const sb = await createClient();

  // ---------------------------------------------
  // LOAD LEADS
  // ---------------------------------------------

  const { data: leadsData, error: leadsError } = await sb
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  // ---------------------------------------------
  // LOAD ACTIVE AGENTS
  // ---------------------------------------------

  const { data: agentsData, error: agentsError } = await sb
    .from("agent_profiles")
    .select("id, agent_name, is_active")
    .eq("is_active", true)
    .order("agent_name", { ascending: true });

  // ---------------------------------------------
  // ERROR
  // ---------------------------------------------

  if (leadsError) {
    return (
      <main style={{ padding: 30 }}>
        <h1>Lead Management</h1>

        <div
          style={{
            marginTop: 20,
            padding: 20,
            borderRadius: 10,
            background: "#fee2e2",
            color: "#991b1b",
          }}
        >
          <strong>Error loading leads</strong>
          <p>{leadsError.message}</p>
        </div>
      </main>
    );
  }

  if (agentsError) {
    return (
      <main style={{ padding: 30 }}>
        <h1>Lead Management</h1>

        <div
          style={{
            marginTop: 20,
            padding: 20,
            borderRadius: 10,
            background: "#fee2e2",
            color: "#991b1b",
          }}
        >
          <strong>Error loading agents</strong>
          <p>{agentsError.message}</p>
        </div>
      </main>
    );
  }

  const leads = (leadsData ?? []) as Lead[];
  const agents = (agentsData ?? []) as Agent[];

  // ---------------------------------------------
  // AGENT LOOKUP
  // ---------------------------------------------

  const agentMap = new Map<string, string>();

  agents.forEach((agent) => {
    agentMap.set(agent.id, agent.agent_name);
  });

  // ---------------------------------------------
  // FOLLOW-UP COUNT
  // ---------------------------------------------

  const followupCount = leads.filter((lead) => {
    return (
      lead.next_followup_at ||
      lead.next_follow_up_date
    );
  }).length;

  // ---------------------------------------------
  // PAGE
  // ---------------------------------------------

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
              color: "#64748b",
              marginTop: 6,
              marginBottom: 0,
            }}
          >
            Manage leads, agents and follow-ups
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
            "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 15,
          marginBottom: 25,
        }}
      >
        {/* TOTAL LEADS */}

        <div
          style={{
            padding: 20,
            border: "1px solid #ddd",
            borderRadius: 12,
            background: "#fff",
          }}
        >
          <div
            style={{
              color: "#64748b",
              marginBottom: 5,
            }}
          >
            Total Leads
          </div>

          <strong
            style={{
              fontSize: 28,
              color: "#0f172a",
            }}
          >
            {leads.length}
          </strong>
        </div>

        {/* ACTIVE AGENTS */}

        <div
          style={{
            padding: 20,
            border: "1px solid #ddd",
            borderRadius: 12,
            background: "#fff",
          }}
        >
          <div
            style={{
              color: "#64748b",
              marginBottom: 5,
            }}
          >
            Active Agents
          </div>

          <strong
            style={{
              fontSize: 28,
              color: "#0f172a",
            }}
          >
            {agents.length}
          </strong>
        </div>

        {/* FOLLOW UPS */}

        <div
          style={{
            padding: 20,
            border: "1px solid #ddd",
            borderRadius: 12,
            background: "#fff",
          }}
        >
          <div
            style={{
              color: "#64748b",
              marginBottom: 5,
            }}
          >
            Follow-ups
          </div>

          <strong
            style={{
              fontSize: 28,
              color: "#0f172a",
            }}
          >
            {followupCount}
          </strong>
        </div>
      </div>

      {/* TABLE */}

      {leads.length > 0 ? (
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
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead) => {
                // ---------------------------------
                // PHONE
                // ---------------------------------

                const phone =
                  lead.phone ??
                  lead.contact_no ??
                  "-";

                // ---------------------------------
                // AGENT
                // ---------------------------------

                const agentId =
                  lead.assigned_agent ??
                  lead.assigned_agent_id ??
                  null;

                const agentName = agentId
                  ? agentMap.get(agentId) ??
                    "Unknown Agent"
                  : "Unassigned";

                // ---------------------------------
                // STATUS
                // ---------------------------------

                const currentStatus =
                  lead.status ??
                  lead.lead_status ??
                  "new";

                // ---------------------------------
                // FOLLOW-UP
                // ---------------------------------

                let followup: Date | null = null;

                if (lead.next_followup_at) {
                  const parsed =
                    new Date(
                      lead.next_followup_at
                    );

                  if (
                    !Number.isNaN(
                      parsed.getTime()
                    )
                  ) {
                    followup = parsed;
                  }
                }

                // If old timestamp is empty,
                // use date + time columns.

                if (
                  !followup &&
                  lead.next_follow_up_date
                ) {
                  const time =
                    lead.next_follow_up_time ??
                    "09:00:00";

                  const parsed =
                    new Date(
                      `${lead.next_follow_up_date}T${time}`
                    );

                  if (
                    !Number.isNaN(
                      parsed.getTime()
                    )
                  ) {
                    followup = parsed;
                  }
                }

                const isOverdue =
                  followup !== null &&
                  followup.getTime() <
                    Date.now();

                return (
                  <tr key={lead.id}>
                    {/* CUSTOMER */}

                    <td>
                      <strong>
                        {lead.customer_name ||
                          "-"}
                      </strong>
                    </td>

                    {/* COMPANY */}

                    <td>
                      {lead.company_name ||
                        "-"}
                    </td>

                    {/* PHONE */}

                    <td>{phone}</td>

                    {/* PRODUCT */}

                    <td>
                      {lead.product || "-"}
                    </td>

                    {/* SOURCE */}

                    <td>
                      {lead.source ||
                        "Manual"}
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
                                ? "#dc2626"
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
                                color:
                                  "#dc2626",
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

                    {/* EDIT */}

                    <td>
                      <Link
                        className="btn"
                        href={`/dashboard/leads/${lead.id}/edit`}
                        style={{
                          display:
                            "inline-block",
                          textDecoration:
                            "none",
                          whiteSpace:
                            "nowrap",
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
      ) : (
        /* EMPTY STATE */

        <div
          style={{
            padding: 40,
            textAlign: "center",
            border: "1px solid #ddd",
            borderRadius: 12,
            background: "#fff",
          }}
        >
          <h3>No leads found</h3>

          <p
            style={{
              color: "#64748b",
            }}
          >
            Create your first lead or import
            leads from Excel.
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
