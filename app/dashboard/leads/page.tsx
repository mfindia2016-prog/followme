"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

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

  next_followup_at: string | null;
  next_follow_up_date: string | null;
  next_follow_up_time: string | null;

  reminder_enabled: boolean | null;

  remarks: string | null;
  notes: string | null;

  created_at: string;
};

type Agent = {
  id: string;
  agent_name: string;
  is_active: boolean;
};

export default function Leads() {
  const supabase = useMemo(
    () => supabaseBrowser(),
    []
  );

  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // FILTERS
  // --------------------------------------------------

  const [agentFilter, setAgentFilter] =
    useState("");

  const [productSearch, setProductSearch] =
    useState("");

  // --------------------------------------------------
  // LOAD DATA
  // --------------------------------------------------

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [
          leadsResult,
          agentsResult,
        ] = await Promise.all([
          supabase
            .from("leads")
            .select("*")
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("agent_profiles")
            .select(
              "id, agent_name, is_active"
            )
            .eq("is_active", true)
            .order("agent_name", {
              ascending: true,
            }),
        ]);

        if (leadsResult.error) {
          throw new Error(
            leadsResult.error.message
          );
        }

        if (agentsResult.error) {
          throw new Error(
            agentsResult.error.message
          );
        }

        setLeads(
          (leadsResult.data ??
            []) as Lead[]
        );

        setAgents(
          (agentsResult.data ??
            []) as Agent[]
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load leads."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [supabase]);

  // --------------------------------------------------
  // AGENT LOOKUP
  // --------------------------------------------------

  const agentMap = useMemo(() => {
    return new Map(
      agents.map((agent) => [
        agent.id,
        agent.agent_name,
      ])
    );
  }, [agents]);

  // --------------------------------------------------
  // FILTER LEADS
  // --------------------------------------------------

  const filteredLeads = useMemo(() => {
    const search =
      productSearch
        .trim()
        .toLowerCase();

    return leads.filter((lead) => {
      // ----------------------------------------------
      // AGENT FILTER
      // ----------------------------------------------

      const matchesAgent =
        !agentFilter ||
        lead.assigned_agent_id ===
          agentFilter;

      // ----------------------------------------------
      // PRODUCT PARTIAL SEARCH
      // ----------------------------------------------

      const product =
        lead.product
          ?.toLowerCase() ?? "";

      const matchesProduct =
        !search ||
        product.includes(search);

      return (
        matchesAgent &&
        matchesProduct
      );
    });
  }, [
    leads,
    agentFilter,
    productSearch,
  ]);

  // --------------------------------------------------
  // COUNTS
  // --------------------------------------------------

  const totalLeads =
    leads.length;

  const filteredCount =
    filteredLeads.length;

  const activeAgents =
    agents.length;

  const followUps =
    filteredLeads.filter(
      (lead) =>
        lead.next_followup_at ||
        lead.next_follow_up_date
    ).length;

  // --------------------------------------------------
  // RESET FILTERS
  // --------------------------------------------------

  function resetFilters() {
    setAgentFilter("");
    setProductSearch("");
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <main style={{ padding: 30 }}>
        <h1>Lead Management</h1>

        <div
          className="card"
          style={{ marginTop: 20 }}
        >
          <p>
            Loading leads...
          </p>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error) {
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
          <strong>
            Error loading leads
          </strong>

          <p>{error}</p>
        </div>
      </main>
    );
  }

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
          justifyContent:
            "space-between",
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
            Manage leads, agents and
            follow-ups
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
          FILTER PANEL
      ================================================== */}

      <div
        className="card"
        style={{
          marginBottom: 25,
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 18,
          }}
        >
          Lead Filters
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 15,
            alignItems: "end",
          }}
        >

          {/* AGENT FILTER */}

          <div className="field">
            <label>
              Filter by Agent
            </label>

            <select
              className="input"
              value={agentFilter}
              onChange={(e) =>
                setAgentFilter(
                  e.target.value
                )
              }
            >
              <option value="">
                All Agents
              </option>

              {agents.map((agent) => (
                <option
                  key={agent.id}
                  value={agent.id}
                >
                  {agent.agent_name}
                </option>
              ))}
            </select>
          </div>

          {/* PRODUCT SEARCH */}

          <div className="field">
            <label>
              Search Product
            </label>

            <input
              className="input"
              value={productSearch}
              onChange={(e) =>
                setProductSearch(
                  e.target.value
                )
              }
              placeholder="Type OT, Table, ECG..."
            />

            <small
              style={{
                display: "block",
                marginTop: 6,
                color: "#64748b",
              }}
            >
              Partial search: OT will find
              OT Table, OT Light, etc.
            </small>
          </div>

          {/* RESET */}

          <div>
            <button
              type="button"
              className="btn"
              onClick={
                resetFilters
              }
              disabled={
                !agentFilter &&
                !productSearch
              }
              style={{
                background:
                  "#e2e8f0",
                color: "#0f172a",
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* FILTER RESULT */}

        <div
          style={{
            marginTop: 20,
            padding: 15,
            borderRadius: 8,
            background: "#f8fafc",
            border:
              "1px solid #e2e8f0",
            display: "flex",
            gap: 25,
            flexWrap: "wrap",
          }}
        >
          <div>
            <span
              style={{
                color: "#64748b",
              }}
            >
              Total Queries
            </span>

            <strong
              style={{
                display: "block",
                fontSize: 24,
              }}
            >
              {totalLeads}
            </strong>
          </div>

          <div>
            <span
              style={{
                color: "#64748b",
              }}
            >
              Filtered Queries
            </span>

            <strong
              style={{
                display: "block",
                fontSize: 24,
              }}
            >
              {filteredCount}
            </strong>
          </div>

          {agentFilter && (
            <div>
              <span
                style={{
                  color: "#64748b",
                }}
              >
                Selected Agent
              </span>

              <strong
                style={{
                  display: "block",
                  fontSize: 18,
                }}
              >
                {agentMap.get(
                  agentFilter
                ) ??
                  "Unknown Agent"}
              </strong>
            </div>
          )}

          {productSearch && (
            <div>
              <span
                style={{
                  color: "#64748b",
                }}
              >
                Product Search
              </span>

              <strong
                style={{
                  display: "block",
                  fontSize: 18,
                }}
              >
                {productSearch}
              </strong>
            </div>
          )}
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

        {/* TOTAL */}

        <div
          style={{
            padding: 18,
            border:
              "1px solid #ddd",
            borderRadius: 10,
            background: "#fff",
          }}
        >
          <div
            style={{
              color: "#666",
            }}
          >
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

        {/* FILTERED */}

        <div
          style={{
            padding: 18,
            border:
              "1px solid #ddd",
            borderRadius: 10,
            background: "#fff",
          }}
        >
          <div
            style={{
              color: "#666",
            }}
          >
            Filtered Queries
          </div>

          <strong
            style={{
              fontSize: 26,
            }}
          >
            {filteredCount}
          </strong>
        </div>

        {/* AGENTS */}

        <div
          style={{
            padding: 18,
            border:
              "1px solid #ddd",
            borderRadius: 10,
            background: "#fff",
          }}
        >
          <div
            style={{
              color: "#666",
            }}
          >
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
            border:
              "1px solid #ddd",
            borderRadius: 10,
            background: "#fff",
          }}
        >
          <div
            style={{
              color: "#666",
            }}
          >
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
              <th>
                Customer
              </th>

              <th>
                Company
              </th>

              <th>
                Phone
              </th>

              <th>
                Product
              </th>

              <th>
                Source
              </th>

              <th>
                Agent
              </th>

              <th>
                Status
              </th>

              <th>
                Next Follow-up
              </th>

              <th>
                Last Remarks
              </th>

              <th>
                Reminder
              </th>

              <th>
                Action
              </th>
            </tr>
          </thead>

          <tbody>

            {filteredLeads.map(
              (lead) => {

                // ------------------------------------------
                // FOLLOW-UP
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
                // AGENT
                // ------------------------------------------

                const agentId =
                  lead.assigned_agent_id;

                const agentName =
                  agentId
                    ? agentMap.get(
                        agentId
                      ) ??
                      "Unknown Agent"
                    : "Unassigned";

                // ------------------------------------------
                // REMARKS
                // ------------------------------------------

                const lastRemarks =
                  lead.remarks?.trim() ||
                  lead.notes?.trim() ||
                  "-";

                return (
                  <tr
                    key={lead.id}
                  >

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

                    {/* FOLLOW-UP */}

                    <td>
                      {followup &&
                      !Number.isNaN(
                        followup.getTime()
                      ) ? (
                        <div>
                          <div
                            style={{
                              fontWeight: 600,
                              color:
                                isOverdue
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
                      ) : lead.next_follow_up_date ? (
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

                          {lead.next_follow_up_time
                            ? `, ${String(
                                lead.next_follow_up_time
                              ).substring(
                                0,
                                5
                              )}`
                            : ""}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* LAST REMARKS */}

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
                        title={
                          lastRemarks
                        }
                      >
                        {lastRemarks}
                      </div>
                    </td>

                    {/* REMINDER */}

                    <td>
                      {lead.reminder_enabled ? (
                        <span
                          style={{
                            color:
                              "green",
                            fontWeight:
                              600,
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          🔔 ON
                        </span>
                      ) : (
                        <span
                          style={{
                            color:
                              "#777",
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
          NO FILTER RESULTS
      ================================================== */}

      {filteredLeads.length === 0 &&
        leads.length > 0 && (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              border:
                "1px solid #ddd",
              borderRadius: 10,
              marginTop: 20,
              background: "#fff",
            }}
          >
            <h3>
              No matching queries
            </h3>

            <p
              style={{
                color: "#666",
              }}
            >
              No leads match the selected
              agent/product filters.
            </p>

            <button
              type="button"
              className="btn"
              onClick={
                resetFilters
              }
            >
              Reset Filters
            </button>
          </div>
        )}

      {/* ==================================================
          EMPTY DATABASE
      ================================================== */}

      {leads.length === 0 && (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            border:
              "1px solid #ddd",
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
            Create your first lead or
            import leads from Excel.
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
