import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

export default async function Leads() {
  const sb = await createClient();

  // --------------------------------------------------
  // LOAD LEADS
  // --------------------------------------------------

  const { data: leads, error: leadsError } = await sb
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  // --------------------------------------------------
  // LOAD ACTIVE AGENTS
  // --------------------------------------------------

  const { data: agents, error: agentsError } = await sb
    .from("agent_profiles")
    .select("id, agent_name, is_active")
    .eq("is_active", true)
    .order("agent_name", { ascending: true });

  // --------------------------------------------------
  // LEADS ERROR
  // --------------------------------------------------

  if (leadsError) {
    return (
      <main style={{ padding: 30 }}>
        <h1>Leads</h1>

        <p style={{ color: "red" }}>
          Error loading leads: {leadsError.message}
        </p>
      </main>
    );
  }

  // --------------------------------------------------
  // AGENTS ERROR
  // --------------------------------------------------

  if (agentsError) {
    return (
      <main style={{ padding: 30 }}>
        <h1>Leads</h1>

        <p style={{ color: "red" }}>
          Error loading agents: {agentsError.message}
        </p>
      </main>
    );
  }

  // --------------------------------------------------
  // AGENT LOOKUP
  // --------------------------------------------------

  const agentMap = new Map(
    (agents ?? []).map((agent: any) => [
      agent.id,
      agent.agent_name,
    ])
  );

  // --------------------------------------------------
  // SUMMARY COUNTS
  // --------------------------------------------------

  const totalLeads = leads?.length ?? 0;

  const activeAgents = agents?.length ?? 0;

  const followUps = (leads ?? []).filter(
    (lead: any) =>
      lead.next_followup_at ||
      lead.next_follow_up_date
  ).length;

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <main style={{ padding: 30 }}>
      {/* ==================================================
          HEADER
      ================================================== */}

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
            Manage leads, agents and follow-ups
          </p>
        </div>

        {/* ACTION BUTTONS */}

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

      {/* ==================================================
          SUMMARY CARDS
      ================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 15,
          marginBottom: 25,
        }}
      >
        {/* TOTAL LEADS */}

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

          <strong
            style={{
              fontSize: 26,
            }}
          >
            {totalLeads}
          </strong>
        </div>

        {/* ACTIVE AGENTS */}

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

          <strong
            style={{
              fontSize: 26,
            }}
          >
            {activeAgents}
          </strong>
        </div>

        {/* FOLLOW UPS */}

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

          <strong
            style={{
              fontSize: 26,
            }}
          >
            {followUps}
          </strong>
        </div>
      </div>

      {/* ==================================================
          LEADS TABLE
      ================================================== */}

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

              {/* NEW COLUMN */}

              <th>Last Remarks</th>

              <th>Reminder</th>

              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {(leads ?? []).map(
              (lead: any) => {
                // ------------------------------------------
                // FOLLOW-UP DATE
                // ------------------------------------------

                const followup =
                  lead.next_followup_at
                    ? new Date(
                        lead.next_followup_at
                      )
                    : null;

                // ------------------------------------------
                // OVERDUE
                // ------------------------------------------

                const isOverdue =
                  followup !== null &&
                  !Number.isNaN(
                    followup.getTime()
                  ) &&
                  followup.getTime() <
                    Date.now();

                // ------------------------------------------
                // AGENT NAME
                // ------------------------------------------

                const agentName =
                  lead.assigned_agent
                    ? agentMap.get(
                        lead.assigned_agent
                      ) ?? "Unknown Agent"
                    : lead.assigned_agent_id
                    ? agentMap.get(
                        lead.assigned_agent_id
                      ) ?? "Unknown Agent"
                    : "Unassigned";

                // ------------------------------------------
                // LAST REMARKS
                //
                // First check remarks.
                // If remarks is empty, check notes.
                // ------------------------------------------

                const lastRemarks =
                  lead.remarks?.trim() ||
                  lead.notes?.trim() ||
                  "-";

                return (
                  <tr key={lead.id}>
                    {/* =====================================
                        CUSTOMER
                    ===================================== */}

                    <td>
                      <strong>
                        {lead.customer_name ??
                          "-"}
                      </strong>
                    </td>

                    {/* =====================================
                        COMPANY
                    ===================================== */}

                    <td>
                      {lead.company_name ??
                        "-"}
                    </td>

                    {/* =====================================
                        PHONE
                    ===================================== */}

                    <td>
                      {lead.phone ??
                        lead.contact_no ??
                        "-"}
                    </td>

                    {/* =====================================
                        PRODUCT
                    ===================================== */}

                    <td>
                      {lead.product ?? "-"}
                    </td>

                    {/* =====================================
                        SOURCE
                    ===================================== */}

                    <td>
                      {lead.source ??
                        "manual"}
                    </td>

                    {/* =====================================
                        AGENT
                    ===================================== */}

                    <td>
                      <strong>
                        {agentName}
                      </strong>
                    </td>

                    {/* =====================================
                        STATUS
                    ===================================== */}

                    <td>
                      <span
                        className={
                          "status " +
                          (lead.status ??
                            lead.lead_status ??
                            "new")
                        }
                      >
                        {lead.status ??
                          lead.lead_status ??
                          "new"}
                      </span>
                    </td>

                    {/* =====================================
                        NEXT FOLLOW-UP
                    ===================================== */}

                    <td>
                      {followup &&
                      !Number.isNaN(
                        followup.getTime()
                      ) ? (
                        <div>
                          <div
                            style={{
                              fontWeight: 600,
                              color: isOverdue
                                ? "red"
                                : "#222",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {followup.toLocaleString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              }
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
                      ) : lead
                          .next_follow_up_date ? (
                        <div>
                          <div
                            style={{
                              fontWeight: 600,
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {
                              lead.next_follow_up_date
                            }

                            {lead
                              .next_follow_up_time
                              ? `, ${String(
                                  lead.next_follow_up_time
                                ).substring(
                                  0,
                                  5
                                )}`
                              : ""}
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* =====================================
                        LAST REMARKS
                    ===================================== */}

                    <td>
                      <div
                        style={{
                          minWidth: 180,
                          maxWidth: 300,
                          whiteSpace:
                            "pre-wrap",
                          overflowWrap:
                            "break-word",
                          lineHeight: 1.4,
                          color:
                            lastRemarks ===
                            "-"
                              ? "#94a3b8"
                              : "#334155",
                          fontSize: 14,
                        }}
                        title={lastRemarks}
                      >
                        {lastRemarks}
                      </div>
                    </td>

                    {/* =====================================
                        REMINDER
                    ===================================== */}

                    <td>
                      {lead.reminder_enabled ? (
                        <span
                          style={{
                            color: "green",
                            fontWeight: 600,
                            whiteSpace:
                              "nowrap",
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

                    {/* =====================================
                        ACTION
                    ===================================== */}

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
              }
            )}
          </tbody>
        </table>
      </div>

      {/* ==================================================
          EMPTY STATE
      ================================================== */}

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

          <p
            style={{
              color: "#666",
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
