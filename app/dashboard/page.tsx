import { createClient } from "@/lib/supabase-server";

type Lead = {
  id: string;
  customer_name?: string | null;
  product?: string | null;
  status?: string | null;
  lead_status?: string | null;
  assigned_agent?: string | null;
  assigned_agent_id?: string | null;
  next_followup_at?: string | null;
  next_follow_up_date?: string | null;
};

type Agent = {
  id: string;
  agent_name: string;
  photo_url?: string | null;
  is_active?: boolean;
};

export default async function Dashboard() {
  const sb = await createClient();

  const [{ data: leads, error: leadsError }, { data: agents, error: agentsError }] =
    await Promise.all([
      sb
        .from("leads")
        .select(
          "id, customer_name, product, status, lead_status, assigned_agent, assigned_agent_id, next_followup_at, next_follow_up_date"
        )
        .order("created_at", { ascending: false }),

      sb
        .from("agent_profiles")
        .select("id, agent_name, photo_url, is_active")
        .eq("is_active", true)
        .order("agent_name", { ascending: true }),
    ]);

  if (leadsError) {
    return (
      <main style={{ padding: 30 }}>
        <h1>Admin Dashboard</h1>
        <p style={{ color: "red" }}>
          Error loading leads: {leadsError.message}
        </p>
      </main>
    );
  }

  if (agentsError) {
    return (
      <main style={{ padding: 30 }}>
        <h1>Admin Dashboard</h1>
        <p style={{ color: "red" }}>
          Error loading agents: {agentsError.message}
        </p>
      </main>
    );
  }

  const leadList = (leads ?? []) as Lead[];
  const agentList = (agents ?? []) as Agent[];

  const totalLeads = leadList.length;
  const activeAgents = agentList.length;

  const now = Date.now();

  let followUps = 0;
  let overdue = 0;
  let upcoming = 0;

  leadList.forEach((lead) => {
    if (lead.next_followup_at) {
      const date = new Date(lead.next_followup_at);

      if (!Number.isNaN(date.getTime())) {
        followUps++;

        if (date.getTime() < now) {
          overdue++;
        } else {
          upcoming++;
        }

        return;
      }
    }

    if (lead.next_follow_up_date) {
      followUps++;

      const date = new Date(`${lead.next_follow_up_date}T23:59:59`);

      if (!Number.isNaN(date.getTime())) {
        if (date.getTime() < now) {
          overdue++;
        } else {
          upcoming++;
        }
      }
    }
  });

  // ------------------------------------------
  // STATUS COUNTS
  // ------------------------------------------

  const statusCounts: Record<string, number> = {};

  leadList.forEach((lead) => {
    const status =
      lead.status ||
      lead.lead_status ||
      "new";

    const key =
      status.charAt(0).toUpperCase() +
      status.slice(1);

    statusCounts[key] =
      (statusCounts[key] || 0) + 1;
  });

  const statusColors: Record<string, string> = {
    New: "#3b82f6",
    Followup: "#f59e0b",
    "Follow-up": "#f59e0b",
    Interested: "#8b5cf6",
    Quoted: "#06b6d4",
    Won: "#22c55e",
    Lost: "#ef4444",
  };

  // ------------------------------------------
  // AGENT COUNTS
  // ------------------------------------------

  const agentCounts: Record<string, number> = {};

  agentList.forEach((agent) => {
    agentCounts[agent.id] = 0;
  });

  leadList.forEach((lead) => {
    const agentId =
      lead.assigned_agent ||
      lead.assigned_agent_id;

    if (agentId && agentCounts[agentId] !== undefined) {
      agentCounts[agentId]++;
    }
  });

  const agentStats = agentList
    .map((agent) => ({
      ...agent,
      count: agentCounts[agent.id] || 0,
    }))
    .sort((a, b) => b.count - a.count);

  const maxAgentLeads = Math.max(
    ...agentStats.map((agent) => agent.count),
    1
  );

  // ------------------------------------------
  // PRODUCT COUNTS
  // ------------------------------------------

  const productCounts: Record<string, number> = {};

  leadList.forEach((lead) => {
    const product = lead.product?.trim();

    if (!product) return;

    const key = product.toLowerCase();

    if (!productCounts[key]) {
      productCounts[key] = 0;
    }

    productCounts[key]++;
  });

  const productStats = Object.entries(productCounts)
    .map(([product, count]) => {
      const originalProduct =
        leadList.find(
          (lead) =>
            lead.product?.trim().toLowerCase() === product
        )?.product?.trim() || product;

      return {
        product: originalProduct,
        count,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const maxProductLeads = Math.max(
    ...productStats.map((item) => item.count),
    1
  );

  // ------------------------------------------
  // STATUS MAX
  // ------------------------------------------

  const maxStatus = Math.max(
    ...Object.values(statusCounts),
    1
  );

  return (
    <main
      style={{
        padding: 30,
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* ==========================================
          HEADER
      ========================================== */}

      <div
        style={{
          marginBottom: 30,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 30,
            fontWeight: 800,
            color: "#0f172a",
          }}
        >
          Admin Dashboard
        </h1>

        <p
          style={{
            marginTop: 7,
            color: "#64748b",
          }}
        >
          Lead, agent and follow-up performance overview
        </p>
      </div>

      {/* ==========================================
          SUMMARY CARDS
      ========================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 18,
          marginBottom: 25,
        }}
      >
        {/* TOTAL LEADS */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: 16,
            padding: 22,
            border: "1px solid #e2e8f0",
            boxShadow:
              "0 4px 15px rgba(15,23,42,0.06)",
            borderLeft: "5px solid #3b82f6",
          }}
        >
          <div
            style={{
              color: "#64748b",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            TOTAL LEADS
          </div>

          <div
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: "#2563eb",
              marginTop: 8,
            }}
          >
            {totalLeads}
          </div>

          <div
            style={{
              marginTop: 5,
              color: "#94a3b8",
              fontSize: 13,
            }}
          >
            All enquiries
          </div>
        </div>

        {/* AGENTS */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: 16,
            padding: 22,
            border: "1px solid #e2e8f0",
            boxShadow:
              "0 4px 15px rgba(15,23,42,0.06)",
            borderLeft: "5px solid #22c55e",
          }}
        >
          <div
            style={{
              color: "#64748b",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            ACTIVE AGENTS
          </div>

          <div
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: "#16a34a",
              marginTop: 8,
            }}
          >
            {activeAgents}
          </div>

          <div
            style={{
              marginTop: 5,
              color: "#94a3b8",
              fontSize: 13,
            }}
          >
            Calling team
          </div>
        </div>

        {/* FOLLOW UPS */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: 16,
            padding: 22,
            border: "1px solid #e2e8f0",
            boxShadow:
              "0 4px 15px rgba(15,23,42,0.06)",
            borderLeft: "5px solid #f59e0b",
          }}
        >
          <div
            style={{
              color: "#64748b",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            FOLLOW-UPS
          </div>

          <div
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: "#d97706",
              marginTop: 8,
            }}
          >
            {followUps}
          </div>

          <div
            style={{
              marginTop: 5,
              color: "#94a3b8",
              fontSize: 13,
            }}
          >
            Scheduled follow-ups
          </div>
        </div>

        {/* OVERDUE */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: 16,
            padding: 22,
            border: "1px solid #e2e8f0",
            boxShadow:
              "0 4px 15px rgba(15,23,42,0.06)",
            borderLeft: "5px solid #ef4444",
          }}
        >
          <div
            style={{
              color: "#64748b",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            OVERDUE
          </div>

          <div
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: "#dc2626",
              marginTop: 8,
            }}
          >
            {overdue}
          </div>

          <div
            style={{
              marginTop: 5,
              color: "#94a3b8",
              fontSize: 13,
            }}
          >
            Needs attention
          </div>
        </div>
      </div>

      {/* ==========================================
          FOLLOW-UP STATUS
      ========================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 15,
          marginBottom: 25,
        }}
      >
        <div
          style={{
            background: "#ecfdf5",
            borderRadius: 14,
            padding: 18,
            border: "1px solid #bbf7d0",
          }}
        >
          <div
            style={{
              color: "#15803d",
              fontWeight: 700,
            }}
          >
            Upcoming Follow-ups
          </div>

          <strong
            style={{
              fontSize: 28,
              color: "#16a34a",
            }}
          >
            {upcoming}
          </strong>
        </div>

        <div
          style={{
            background: "#fef2f2",
            borderRadius: 14,
            padding: 18,
            border: "1px solid #fecaca",
          }}
        >
          <div
            style={{
              color: "#b91c1c",
              fontWeight: 700,
            }}
          >
            Overdue Follow-ups
          </div>

          <strong
            style={{
              fontSize: 28,
              color: "#dc2626",
            }}
          >
            {overdue}
          </strong>
        </div>
      </div>

      {/* ==========================================
          STATUS + AGENTS
      ========================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(350px, 1fr))",
          gap: 20,
          marginBottom: 25,
        }}
      >
        {/* STATUS GRAPH */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: 16,
            padding: 24,
            border: "1px solid #e2e8f0",
            boxShadow:
              "0 4px 15px rgba(15,23,42,0.05)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#0f172a",
            }}
          >
            Lead Status
          </h2>

          <p
            style={{
              color: "#64748b",
              fontSize: 14,
            }}
          >
            Current lead distribution
          </p>

          {Object.entries(statusCounts).map(
            ([status, count]) => {
              const percentage =
                (count / maxStatus) * 100;

              const color =
                statusColors[status] ||
                "#64748b";

              return (
                <div
                  key={status}
                  style={{
                    marginTop: 18,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      marginBottom: 7,
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    <span>{status}</span>
                    <span>{count}</span>
                  </div>

                  <div
                    style={{
                      height: 12,
                      background: "#e2e8f0",
                      borderRadius: 20,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: "100%",
                        background: color,
                        borderRadius: 20,
                      }}
                    />
                  </div>
                </div>
              );
            }
          )}

          {Object.keys(statusCounts).length === 0 && (
            <p style={{ color: "#94a3b8" }}>
              No lead data available.
            </p>
          )}
        </div>

        {/* AGENT GRAPH */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: 16,
            padding: 24,
            border: "1px solid #e2e8f0",
            boxShadow:
              "0 4px 15px rgba(15,23,42,0.05)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#0f172a",
            }}
          >
            Agent-wise Leads
          </h2>

          <p
            style={{
              color: "#64748b",
              fontSize: 14,
            }}
          >
            Leads assigned to each agent
          </p>

          {agentStats.map((agent) => {
            const percentage =
              (agent.count / maxAgentLeads) *
              100;

            return (
              <div
                key={agent.id}
                style={{
                  marginTop: 17,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    marginBottom: 7,
                  }}
                >
                  {agent.photo_url ? (
                    <img
                      src={agent.photo_url}
                      alt={agent.agent_name}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background: "#dbeafe",
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "center",
                        fontWeight: 700,
                        color: "#2563eb",
                      }}
                    >
                      {agent.agent_name
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <strong
                    style={{
                      flex: 1,
                    }}
                  >
                    {agent.agent_name}
                  </strong>

                  <span
                    style={{
                      fontWeight: 700,
                    }}
                  >
                    {agent.count}
                  </span>
                </div>

                <div
                  style={{
                    height: 11,
                    background: "#e2e8f0",
                    borderRadius: 20,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: "100%",
                      background:
                        "linear-gradient(90deg, #2563eb, #06b6d4)",
                      borderRadius: 20,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==========================================
          PRODUCT GRAPH
      ========================================== */}

      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          padding: 24,
          border: "1px solid #e2e8f0",
          boxShadow:
            "0 4px 15px rgba(15,23,42,0.05)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            color: "#0f172a",
          }}
        >
          Product-wise Queries
        </h2>

        <p
          style={{
            color: "#64748b",
            fontSize: 14,
          }}
        >
          Which products are receiving the most enquiries
        </p>

        {productStats.map((item) => {
          const percentage =
            (item.count / maxProductLeads) *
            100;

          return (
            <div
              key={item.product}
              style={{
                marginTop: 17,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  gap: 15,
                  marginBottom: 7,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.product}
                </span>

                <span>{item.count}</span>
              </div>

              <div
                style={{
                  height: 12,
                  background: "#e2e8f0",
                  borderRadius: 20,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${percentage}%`,
                    height: "100%",
                    background:
                      "linear-gradient(90deg, #8b5cf6, #ec4899)",
                    borderRadius: 20,
                  }}
                />
              </div>
            </div>
          );
        })}

        {productStats.length === 0 && (
          <p
            style={{
              color: "#94a3b8",
            }}
          >
            No product data available.
          </p>
        )}
      </div>
    </main>
  );
}
