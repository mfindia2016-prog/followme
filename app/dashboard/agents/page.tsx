"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Agent = {
  id: string;
  agent_name: string;
  photo_url?: string | null;
  mobile_no?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
};

export default function Agents() {
  const supabase = supabaseBrowser;

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAgents() {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("agent_profiles")
        .select(
          "id, agent_name, photo_url, mobile_no, is_active, created_at"
        )
        .order("agent_name", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      setAgents((data ?? []) as Agent[]);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message ||
          "Unable to load agents."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAgents();
  }, []);

  if (loading) {
    return (
      <main
        style={{
          padding: 30,
        }}
      >
        <h1>Agents</h1>

        <p
          style={{
            color: "#64748b",
          }}
        >
          Loading agents...
        </p>
      </main>
    );
  }

  return (
    <main
      style={{
        padding: 30,
      }}
    >
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
          <h1
            style={{
              margin: 0,
            }}
          >
            Agents
          </h1>

          <p
            style={{
              marginTop: 6,
              color: "#64748b",
            }}
          >
            Manage MF India CRM agents
          </p>
        </div>

        <button
          type="button"
          className="btn"
          onClick={loadAgents}
        >
          Refresh
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div
          style={{
            padding: 15,
            marginBottom: 20,
            borderRadius: 10,
            background: "#fee2e2",
            color: "#991b1b",
            border: "1px solid #fecaca",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

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
            border: "1px solid #e2e8f0",
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
            Total Agents
          </div>

          <strong
            style={{
              fontSize: 28,
            }}
          >
            {agents.length}
          </strong>
        </div>

        <div
          style={{
            padding: 18,
            border: "1px solid #e2e8f0",
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
              color: "#16a34a",
            }}
          >
            {
              agents.filter(
                (agent) =>
                  agent.is_active === true
              ).length
            }
          </strong>
        </div>
      </div>

      {/* AGENTS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 18,
        }}
      >
        {agents.map((agent) => {
          const initial =
            agent.agent_name
              ?.charAt(0)
              ?.toUpperCase() || "A";

          return (
            <div
              key={agent.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                padding: 18,
                background: "#fff",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              {/* AGENT PHOTO */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 15,
                }}
              >
                {agent.photo_url ? (
                  <img
                    src={agent.photo_url}
                    alt={agent.agent_name}
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border:
                        "3px solid #e2e8f0",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: "50%",
                      background: "#e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#475569",
                    }}
                  >
                    {initial}
                  </div>
                )}

                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 18,
                    }}
                  >
                    {agent.agent_name}
                  </h3>

                  <div
                    style={{
                      marginTop: 5,
                      fontSize: 13,
                      color:
                        agent.is_active
                          ? "#16a34a"
                          : "#64748b",
                      fontWeight: 600,
                    }}
                  >
                    {agent.is_active
                      ? "● Active"
                      : "● Inactive"}
                  </div>
                </div>
              </div>

              {/* MOBILE */}

              <div
                style={{
                  color: "#475569",
                  fontSize: 14,
                  marginBottom: 8,
                }}
              >
                <strong>Mobile:</strong>{" "}
                {agent.mobile_no || "-"}
              </div>

              {/* ID */}

              <div
                style={{
                  color: "#94a3b8",
                  fontSize: 11,
                  wordBreak: "break-all",
                }}
              >
                ID: {agent.id}
              </div>
            </div>
          );
        })}
      </div>

      {/* EMPTY */}

      {agents.length === 0 &&
        !error && (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              background: "#fff",
            }}
          >
            <h3>No agents found</h3>

            <p
              style={{
                color: "#64748b",
              }}
            >
              No agent profiles are available.
            </p>
          </div>
        )}
    </main>
  );
}
