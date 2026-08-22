"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Agent = {
  id: string;
  agent_name: string;
  is_active: boolean;
};

export default function NewLeadPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Manual product text
  const [product, setProduct] = useState("");

  const [source, setSource] = useState("");

  // This stores the AGENT UUID
  const [assignedAgent, setAssignedAgent] = useState("");

  const [status, setStatus] = useState("new");
  const [remarks, setRemarks] = useState("");

  const [nextFollowUpDate, setNextFollowUpDate] =
    useState("");

  const [nextFollowUpTime, setNextFollowUpTime] =
    useState("");

  const [reminderEnabled, setReminderEnabled] =
    useState(true);

  // ==================================================
  // LOAD ACTIVE AGENTS
  // ==================================================

  useEffect(() => {
    let mounted = true;

    async function loadAgents() {
      setLoadingAgents(true);
      setError("");

      const { data, error } = await supabase
        .from("agent_profiles")
        .select("id, agent_name, is_active")
        .eq("is_active", true)
        .order("agent_name", {
          ascending: true,
        });

      if (!mounted) return;

      if (error) {
        console.error(
          "AGENT LOAD ERROR:",
          error
        );

        setError(
          `Unable to load agents: ${error.message}`
        );

        setAgents([]);
      } else {
        setAgents(
          (data ?? []) as Agent[]
        );
      }

      setLoadingAgents(false);
    }

    loadAgents();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  // ==================================================
  // SAVE NEW LEAD
  // ==================================================

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    // ----------------------------------------------
    // REQUIRED FIELDS
    // ----------------------------------------------

    if (!customerName.trim()) {
      setError(
        "Customer Name is required."
      );
      return;
    }

    if (!product.trim()) {
      setError(
        "Product Name is required."
      );
      return;
    }

    setSaving(true);

    try {
      // ----------------------------------------------
      // CHECK LOGIN
      // ----------------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(
          userError.message
        );
      }

      if (!user) {
        throw new Error(
          "Your login session has expired. Please login again."
        );
      }

      // ----------------------------------------------
      // VALIDATE SELECTED AGENT
      // ----------------------------------------------

      let agentId: string | null =
        assignedAgent || null;

      if (agentId) {
        const selectedAgent =
          agents.find(
            (agent) =>
              agent.id === agentId
          );

        if (!selectedAgent) {
          throw new Error(
            "Selected agent is not available. Please select the agent again."
          );
        }

        agentId = selectedAgent.id;
      }

      // ----------------------------------------------
      // FOLLOW-UP TIMESTAMP
      // ----------------------------------------------

      let nextFollowupAt: string | null =
        null;

      if (nextFollowUpDate) {
        const time =
          nextFollowUpTime || "09:00";

        const localDate = new Date(
          `${nextFollowUpDate}T${time}:00`
        );

        if (
          Number.isNaN(
            localDate.getTime()
          )
        ) {
          throw new Error(
            "Invalid follow-up date or time."
          );
        }

        nextFollowupAt =
          localDate.toISOString();
      }

      // ----------------------------------------------
      // INSERT LEAD
      // ----------------------------------------------

      const leadData = {
        customer_name:
          customerName.trim(),

        company_name:
          companyName.trim() || null,

        phone:
          phone.trim() || null,

        contact_no:
          phone.trim() || null,

        email:
          email.trim() || null,

        email_id:
          email.trim() || null,

        city:
          city.trim() || null,

        state:
          state.trim() || null,

        // Manual product
        product:
          product.trim(),

        source:
          source.trim() || null,

        // IMPORTANT:
        // Both fields receive the SAME agent UUID
        assigned_agent:
          agentId,

        assigned_agent_id:
          agentId,

        status,

        lead_status:
          status,

        remarks:
          remarks.trim() || null,

        notes:
          remarks.trim() || null,

        next_followup_at:
          nextFollowupAt,

        next_follow_up_date:
          nextFollowUpDate || null,

        next_follow_up_time:
          nextFollowUpTime || null,

        reminder_enabled:
          reminderEnabled,

        created_by:
          user.id,
      };

      console.log(
        "CREATING LEAD:",
        leadData
      );

      const {
        data: insertedLead,
        error: insertError,
      } = await supabase
        .from("leads")
        .insert(leadData)
        .select("id, assigned_agent, assigned_agent_id")
        .single();

      if (insertError) {
        throw new Error(
          insertError.message
        );
      }

      console.log(
        "LEAD CREATED:",
        insertedLead
      );

      // ----------------------------------------------
      // VERIFY AGENT ASSIGNMENT
      // ----------------------------------------------

      if (
        agentId &&
        insertedLead?.assigned_agent !==
          agentId
      ) {
        console.warn(
          "Agent assignment verification failed.",
          {
            expected: agentId,
            actual:
              insertedLead?.assigned_agent,
          }
        );
      }

      // ----------------------------------------------
      // GO BACK TO LEADS
      // ----------------------------------------------

      router.push(
        "/dashboard/leads"
      );

      router.refresh();
    } catch (err) {
      console.error(
        "CREATE LEAD ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating the lead."
      );

      setSaving(false);
    }
  }

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <div>
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 25,
        }}
      >
        <div>
          <h1
            style={{
              marginBottom: 5,
            }}
          >
            New Lead
          </h1>

          <p
            style={{
              margin: 0,
              color: "#64748b",
            }}
          >
            Add customer, product, agent
            and follow-up details.
          </p>
        </div>

        <button
          type="button"
          className="btn"
          disabled={saving}
          onClick={() =>
            router.push(
              "/dashboard/leads"
            )
          }
        >
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ==================================================
            CUSTOMER
        ================================================== */}

        <div className="card">
          <h2>
            Customer Information
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: 20,
            }}
          >
            <div className="field">
              <label>
                Customer Name *
              </label>

              <input
                className="input"
                value={customerName}
                onChange={(e) =>
                  setCustomerName(
                    e.target.value
                  )
                }
                placeholder="Customer name"
                required
              />
            </div>

            <div className="field">
              <label>
                Company Name
              </label>

              <input
                className="input"
                value={companyName}
                onChange={(e) =>
                  setCompanyName(
                    e.target.value
                  )
                }
                placeholder="Company name"
              />
            </div>

            <div className="field">
              <label>
                Mobile Number
              </label>

              <input
                className="input"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
                placeholder="+91XXXXXXXXXX"
              />
            </div>

            <div className="field">
              <label>Email</label>

              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                placeholder="customer@email.com"
              />
            </div>

            <div className="field">
              <label>City</label>

              <input
                className="input"
                value={city}
                onChange={(e) =>
                  setCity(
                    e.target.value
                  )
                }
                placeholder="City"
              />
            </div>

            <div className="field">
              <label>State</label>

              <input
                className="input"
                value={state}
                onChange={(e) =>
                  setState(
                    e.target.value
                  )
                }
                placeholder="State"
              />
            </div>
          </div>
        </div>

        {/* ==================================================
            PRODUCT
        ================================================== */}

        <div
          className="card"
          style={{
            marginTop: 20,
          }}
        >
          <h2>Product</h2>

          <div className="field">
            <label>
              Product Name *
            </label>

            <input
              className="input"
              value={product}
              onChange={(e) =>
                setProduct(
                  e.target.value
                )
              }
              placeholder="Enter product name"
              required
            />

            <p
              style={{
                marginTop: 7,
                color: "#64748b",
                fontSize: 14,
              }}
            >
              Enter the product manually.
              Imported leads can also fill
              this field automatically.
            </p>
          </div>
        </div>

        {/* ==================================================
            LEAD ASSIGNMENT
        ================================================== */}

        <div
          className="card"
          style={{
            marginTop: 20,
          }}
        >
          <h2>
            Lead Assignment
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: 20,
            }}
          >
            {/* SOURCE */}

            <div className="field">
              <label>Source</label>

              <input
                className="input"
                value={source}
                onChange={(e) =>
                  setSource(
                    e.target.value
                  )
                }
                placeholder="IndiaMART / TradeIndia / Website / WhatsApp"
              />
            </div>

            {/* AGENT */}

            <div className="field">
              <label>
                Assign Agent
              </label>

              <select
                className="input"
                value={assignedAgent}
                onChange={(e) =>
                  setAssignedAgent(
                    e.target.value
                  )
                }
                disabled={
                  loadingAgents ||
                  saving
                }
              >
                <option value="">
                  {loadingAgents
                    ? "Loading agents..."
                    : "Unassigned"}
                </option>

                {agents.map(
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

              <p
                style={{
                  marginTop: 7,
                  color: "#64748b",
                  fontSize: 13,
                }}
              >
                Select the agent who will
                handle this lead.
              </p>
            </div>

            {/* STATUS */}

            <div className="field">
              <label>Status</label>

              <select
                className="input"
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value
                  )
                }
              >
                <option value="new">
                  New
                </option>

                <option value="followup">
                  Follow-up
                </option>

                <option value="interested">
                  Interested
                </option>

                <option value="quoted">
                  Quoted
                </option>

                <option value="won">
                  Won
                </option>

                <option value="lost">
                  Lost
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* ==================================================
            FOLLOW-UP
        ================================================== */}

        <div
          className="card"
          style={{
            marginTop: 20,
          }}
        >
          <h2>
            Next Follow-up
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: 20,
            }}
          >
            <div className="field">
              <label>
                Follow-up Date
              </label>

              <input
                className="input"
                type="date"
                value={
                  nextFollowUpDate
                }
                onChange={(e) =>
                  setNextFollowUpDate(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="field">
              <label>
                Follow-up Time
              </label>

              <input
                className="input"
                type="time"
                value={
                  nextFollowUpTime
                }
                onChange={(e) =>
                  setNextFollowUpTime(
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <input
              type="checkbox"
              id="reminder"
              checked={
                reminderEnabled
              }
              onChange={(e) =>
                setReminderEnabled(
                  e.target.checked
                )
              }
            />

            <label htmlFor="reminder">
              Enable reminder
            </label>
          </div>
        </div>

        {/* ==================================================
            REMARKS
        ================================================== */}

        <div
          className="card"
          style={{
            marginTop: 20,
          }}
        >
          <h2>
            Remarks / Notes
          </h2>

          <textarea
            className="input"
            value={remarks}
            onChange={(e) =>
              setRemarks(
                e.target.value
              )
            }
            placeholder="Enter remarks, requirements, conversation notes..."
            rows={5}
            style={{
              resize: "vertical",
            }}
          />
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div
            style={{
              marginTop: 20,
              padding: 15,
              borderRadius: 8,
              background: "#fee2e2",
              color: "#b91c1c",
            }}
          >
            {error}
          </div>
        )}

        {/* ==================================================
            BUTTONS
        ================================================== */}

        <div
          style={{
            marginTop: 25,
            display: "flex",
            gap: 12,
            paddingBottom: 40,
          }}
        >
          <button
            type="submit"
            className="btn"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Lead"}
          </button>

          <button
            type="button"
            className="btn"
            disabled={saving}
            style={{
              background: "#e2e8f0",
              color: "#0f172a",
            }}
            onClick={() =>
              router.push(
                "/dashboard/leads"
              )
            }
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
