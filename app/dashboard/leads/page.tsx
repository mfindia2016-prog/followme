import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

type Agent = {
  id: string;
  agent_name: string;
  is_active: boolean;
  photo_url: string | null;
};

type LeadsPageProps = {
  searchParams?: Promise<{
    agent?: string;
    product?: string;
  }>;
};

export default async function Leads({
  searchParams,
}: LeadsPageProps) {
  const sb = await createClient();

  // --------------------------------------------------
  // FILTER VALUES
  // --------------------------------------------------

  const params = searchParams
    ? await searchParams
    : {};

  const selectedAgent = params.agent ?? "";
  const productSearch = params.product?.trim() ?? "";

  // --------------------------------------------------
  // LOAD AGENTS
  // --------------------------------------------------

  const {
    data: agents,
    error: agentsError,
  } = await sb
    .from("agent_profiles")
    .select(
      "id, agent_name, is_active, photo_url"
    )
    .order("agent_name", {
      ascending: true,
    });

  if (agentsError) {
    return (
      <main style={{ padding: 30 }}>
        <h1>Leads</h1>

        <p style={{ color: "red" }}>
          Error loading agents:{" "}
          {agentsError.message}
        </p>
      </main>
    );
  }

  const allAgents = (agents ?? []) as Agent[];

  const activeAgents = allAgents.filter(
    (agent) => agent.is_active
  );

  // --------------------------------------------------
  // LOAD LEADS QUERY
  // --------------------------------------------------

  let leadsQuery = sb
    .from("leads")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  // --------------------------------------------------
  // PRODUCT FILTER
  //
  // Example:
  // OT
  // table
  // OT table
  // --------------------------------------------------

  if (productSearch) {
    leadsQuery = leadsQuery.ilike(
      "product",
      `%${productSearch}%`
    );
  }

  // --------------------------------------------------
  // AGENT FILTER
  // --------------------------------------------------

  if (selectedAgent) {
    leadsQuery = leadsQuery.or(
      `assigned_agent.eq.${selectedAgent},assigned_agent_id.eq.${selectedAgent}`
    );
  }

  // --------------------------------------------------
  // GET LEADS
  // --------------------------------------------------

  const {
    data: leads,
    error: leadsError,
  } = await leadsQuery;

  // --------------------------------------------------
  // LEADS ERROR
  // --------------------------------------------------

  if (leadsError) {
    return (
      <main style={{ padding: 30 }}>
        <h1>Leads</h1>

        <p style={{ color: "red" }}>
          Error loading leads:{" "}
          {leadsError.message}
        </p>
      </main>
    );
  }

  // --------------------------------------------------
  // AGENT LOOKUP
  // --------------------------------------------------

  const agentMap = new Map(
    allAgents.map((agent) => [
      agent.id,
      agent,
    ])
  );

  // --------------------------------------------------
  // SUMMARY COUNTS
  // --------------------------------------------------

  const totalLeads = leads?.length ?? 0;

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
          FILTERS
      ================================================== */}

      <form
        method="GET"
        style={{
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 18,
          marginBottom: 25,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "end",
            gap: 15,
            flexWrap: "wrap",
          }}
        >
          {/* AGENT FILTER */}

          <div
            style={{
              minWidth: 220,
              flex: "1 1 220px",
            }}
          >
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: 7,
              }}
            >
              Filter by Agent
            </label>

            <select
              name="agent"
              defaultValue={selectedAgent}
              className="input"
              style={{
                width: "100%",
              }}
            >
              <option value="">
                All Agents
              </option>

              {activeAgents.map(
                (agent) => (
                  <option
                    key={agent.id}
                    value={agent.id}
                  >
                    {agent.agent_name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* PRODUCT FILTER */}

          <div
            style={{
              minWidth: 280,
              flex: "2 1 300px",
            }}
          >
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: 7,
              }}
            >
              Search Product
            </label>

            <input
              name="product"
              defaultValue={productSearch}
              className="input"
              placeholder="Search OT, table, OT table..."
              style={{
                width: "100%",
              }}
            />
          </div>

          {/* SEARCH */}

          <button
            type="submit"
            className="btn"
            style={{
              height: 42,
            }}
          >
            🔍 Filter
          </button>

          {/* CLEAR */}

          <Link
            href="/dashboard/leads"
            className="btn"
            style={{
              background: "#e2e8f0",
              color: "#0f172a",
              textDecoration: "none",
              height: 42,
              display: "flex",
              alignItems: "center",
            }}
          >
            Clear
          </Link>
        </div>

        {/* ACTIVE FILTER DISPLAY */}

        {(selectedAgent ||
          productSearch) && (
          <div
            style={{
              marginTop: 12,
              color: "#475569",
              fontSize: 14,
            }}
          >
            Showing filtered leads
            {productSearch
              ? ` for product "${productSearch}"`
              : ""}
            {selectedAgent
              ? ` assigned to ${
                  agentMap.get(
                    selectedAgent
                  )?.agent_name ??
                  "Selected Agent"
                }`
              : ""}
          </div>
        )}
      </form>

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
            {selectedAgent ||
            productSearch
              ? "Filtered Leads"
              : "Total Leads"}
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
            {activeAgents.length}
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
                // AGENT ID
                // ------------------------------------------

                const agentId =
                  lead.assigned_agent ||
                  lead.assigned_agent_id ||
                  "";

                // ------------------------------------------
                // AGENT OBJECT
                // ------------------------------------------

                const agent =
                  agentId
                    ? agentMap.get(agentId)
                    : null;

                // ------------------------------------------
                // AGENT NAME
                // ------------------------------------------

                const agentName =
                  agent?.agent_name ??
                  "Unassigned";

                // ------------------------------------------
                // LAST REMARKS
                // ------------------------------------------

                const lastRemarks =
                  typeof lead.remarks ===
                    "string" &&
                  lead.remarks.trim()
                    ? lead.remarks.trim()
                    : typeof lead.notes ===
                        "string" &&
                      lead.notes.trim()
                    ? lead.notes.trim()
                    : "-";

                return (
                  <tr key={lead.id}>
                    {/* CUSTOMER */}

                    <td>
                      <strong>
                        {lead.customer_name ??
                          "-"}
                      </strong>
                    </td>

                    {/* COMPANY */}

                    <td>
                      {lead.company_name ??
                        "-"}
                    </td>

                    {/* PHONE */}

                    <td>
                      {lead.phone ??
                        lead.contact_no ??
                        "-"}
                    </td>

                    {/* PRODUCT */}

                    <td>
                      <strong>
                        {lead.product ??
                          "-"}
                      </strong>
                    </td>

                    {/* SOURCE */}

                    <td>
                      {lead.source ??
                        "manual"}
                    </td>

                    {/* ==================================================
                        AGENT WITH PHOTO
                    ================================================== */}

                    <td>
                      {agent ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems:
                              "center",
                            gap: 8,
                            minWidth: 140,
                          }}
                        >
                          {agent.photo_url ? (
                            <img
                              src={
                                agent.photo_url
                              }
                              alt={
                                agent.agent_name
                              }
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius:
                                  "50%",
                                objectFit:
                                  "cover",
                                border:
                                  "2px solid #e2e8f0",
                                flexShrink: 0,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius:
                                  "50%",
                                background:
                                  "#e2e8f0",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                fontWeight: 700,
                                color:
                                  "#475569",
                                flexShrink: 0,
                              }}
                            >
                              {agent.agent_name
                                .charAt(
                                  0
                                )
                                .toUpperCase()}
                            </div>
                          )}

                          <strong>
                            {
                              agent.agent_name
                            }
                          </strong>
                        </div>
                      ) : (
                        <span
                          style={{
                            color:
                              "#94a3b8",
                            fontWeight: 500,
                          }}
                        >
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* STATUS */}

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

                    {/* NEXT FOLLOW-UP */}

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
                                minute:
                                  "2-digit",
                                hour12:
                                  true,
                              }
                            )}
                          </div>

                          {isOverdue && (
                            <small
                              style={{
                                color:
                                  "red",
                                fontWeight:
                                  700,
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

                    {/* ==================================================
                        LAST REMARKS
                    ================================================== */}

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

                    {/* REMINDER */}

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

                    {/* ACTION */}

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
          <h3>
            No leads found
          </h3>

          <p
            style={{
              color: "#666",
            }}
          >
            No leads match the selected
            filters.
          </p>

          <Link
            className="btn"
            href="/dashboard/leads"
          >
            Clear Filters
          </Link>
        </div>
      )}
    </main>
  );
}
