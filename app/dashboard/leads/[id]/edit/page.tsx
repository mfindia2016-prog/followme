"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Agent = {
  id: string;
  agent_name: string;
  is_active?: boolean;
};

export default function EditLeadPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [agents, setAgents] = useState<Agent[]>([]);

  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Product is manual text.
  // It can also be filled automatically by imported leads.
  const [product, setProduct] = useState("");

  const [source, setSource] = useState("");
  const [assignedAgent, setAssignedAgent] = useState("");
  const [status, setStatus] = useState("new");

  const [remarks, setRemarks] = useState("");

  const [nextFollowUpDate, setNextFollowUpDate] =
    useState("");

  const [nextFollowUpTime, setNextFollowUpTime] =
    useState("");

  const [reminderEnabled, setReminderEnabled] =
    useState(true);

  // --------------------------------------------------
  // LOAD LEAD
  // --------------------------------------------------

  useEffect(() => {
    async function loadLead() {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          throw new Error("Lead ID is missing from the URL.");
        }

        const supabase = supabaseBrowser();

        // Load lead
        const { data, error: leadError } = await supabase
          .from("leads")
          .select("*")
          .eq("id", id)
          .single();

        if (leadError) {
          throw new Error(leadError.message);
        }

        if (!data) {
          throw new Error("Lead not found.");
        }

        // ------------------------------------------------
        // CUSTOMER
        // ------------------------------------------------

        setCustomerName(data.customer_name ?? "");

        setCompanyName(data.company_name ?? "");

        setPhone(
          data.phone ??
            data.contact_no ??
            ""
        );

        setEmail(
          data.email ??
            data.email_id ??
            ""
        );

        setCity(data.city ?? "");

        setState(data.state ?? "");

        // ------------------------------------------------
        // PRODUCT
        // ------------------------------------------------

        setProduct(data.product ?? "");

        // ------------------------------------------------
        // SOURCE
        // ------------------------------------------------

        setSource(data.source ?? "");

        // ------------------------------------------------
        // AGENT
        // ------------------------------------------------

        setAssignedAgent(
          data.assigned_agent ??
            data.assigned_agent_id ??
            ""
        );

        // ------------------------------------------------
        // STATUS
        // ------------------------------------------------

        setStatus(
          data.status ??
            data.lead_status ??
            "new"
        );

        // ------------------------------------------------
        // REMARKS / NOTES
        // ------------------------------------------------

        setRemarks(
          data.remarks ??
            data.notes ??
            ""
        );

        // ------------------------------------------------
        // FOLLOW-UP DATE
        // ------------------------------------------------

        if (data.next_follow_up_date) {
          setNextFollowUpDate(
            data.next_follow_up_date
          );
        }

        // ------------------------------------------------
        // FOLLOW-UP TIME
        // ------------------------------------------------

        if (data.next_follow_up_time) {
          setNextFollowUpTime(
            String(data.next_follow_up_time).substring(
              0,
              5
            )
          );
        }

        // ------------------------------------------------
        // OLD TIMESTAMP SUPPORT
        // ------------------------------------------------

        if (
          data.next_followup_at &&
          !data.next_follow_up_date
        ) {
          const date = new Date(
            data.next_followup_at
          );

          if (!Number.isNaN(date.getTime())) {
            const year = date.getFullYear();

            const month = String(
              date.getMonth() + 1
            ).padStart(2, "0");

            const day = String(
              date.getDate()
            ).padStart(2, "0");

            const hours = String(
              date.getHours()
            ).padStart(2, "0");

            const minutes = String(
              date.getMinutes()
            ).padStart(2, "0");

            setNextFollowUpDate(
              `${year}-${month}-${day}`
            );

            setNextFollowUpTime(
              `${hours}:${minutes}`
            );
          }
        }

        // ------------------------------------------------
        // REMINDER
        // ------------------------------------------------

        setReminderEnabled(
          data.reminder_enabled !== false
        );

        // ------------------------------------------------
        // LOAD AGENTS
        // ------------------------------------------------

        const {
          data: agentData,
          error: agentError,
        } = await supabase
          .from("agent_profiles")
          .select(
            "id, agent_name, is_active"
          )
          .order("agent_name", {
            ascending: true,
          });

        if (!agentError) {
          setAgents(
            (agentData ?? []) as Agent[]
          );
        } else {
          console.error(
            "Agent loading error:",
            agentError
          );
        }

        setLoading(false);
      } catch (err) {
        console.error(
          "EDIT LEAD ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load lead."
        );

        setLoading(false);
      }
    }

    loadLead();
  }, [id]);

  // --------------------------------------------------
  // SAVE / UPDATE LEAD
  // --------------------------------------------------

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!customerName.trim()) {
      setError("Customer Name is required.");
      return;
    }

    if (!product.trim()) {
      setError("Product Name is required.");
      return;
    }

    setSaving(true);

    try {
      const supabase = supabaseBrowser();

      // ------------------------------------------------
      // CREATE FOLLOW-UP TIMESTAMP
      // ------------------------------------------------

      let nextFollowupAt: string | null = null;

      if (nextFollowUpDate) {
        const time =
          nextFollowUpTime || "09:00";

        const date = new Date(
          `${nextFollowUpDate}T${time}:00`
        );

        if (!Number.isNaN(date.getTime())) {
          nextFollowupAt =
            date.toISOString();
        }
      }

      // ------------------------------------------------
      // UPDATE LEAD
      // ------------------------------------------------

      const { error: updateError } =
        await supabase
          .from("leads")
          .update({
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

            // MANUAL PRODUCT
            product:
              product.trim(),

            source:
              source.trim() || null,

            assigned_agent:
              assignedAgent || null,

            assigned_agent_id:
              assignedAgent || null,

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

            updated_at:
              new Date().toISOString(),
          })
          .eq("id", id);

      if (updateError) {
        throw new Error(
          updateError.message
        );
      }

      setSuccess(
        "Lead updated successfully."
      );

      setSaving(false);

      setTimeout(() => {
        router.push("/dashboard/leads");
        router.refresh();
      }, 700);
    } catch (err) {
      console.error(
        "UPDATE LEAD ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update lead."
      );

      setSaving(false);
    }
  }

  // --------------------------------------------------
  // LOADING SCREEN
  // --------------------------------------------------

  if (loading) {
    return (
      <div>
        <h1>Edit Lead</h1>

        <div
          className="card"
          style={{
            marginTop: 20,
          }}
        >
          <p>Loading lead...</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // LOAD ERROR
  // --------------------------------------------------

  if (error && !customerName) {
    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 25,
          }}
        >
          <h1>Edit Lead</h1>

          <button
            type="button"
            className="btn"
            onClick={() =>
              router.push(
                "/dashboard/leads"
              )
            }
          >
            ← Back
          </button>
        </div>

        <div
          style={{
            padding: 20,
            borderRadius: 10,
            background: "#fee2e2",
            color: "#991b1b",
          }}
        >
          <strong>
            Unable to load lead
          </strong>

          <p>{error}</p>

          <small>
            Lead ID: {id || "missing"}
          </small>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // EDIT FORM
  // --------------------------------------------------

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
          <h1>Edit Lead</h1>

          <p
            style={{
              margin: 0,
              color: "#64748b",
            }}
          >
            Update customer, product,
            agent and follow-up details.
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
        {/* CUSTOMER INFORMATION */}

        <div className="card">
          <h2>Customer Information</h2>

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

        {/* PRODUCT */}

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
              placeholder="Enter or change product name"
              required
            />

            <p
              style={{
                marginTop: 7,
                color: "#64748b",
                fontSize: 14,
              }}
            >
              Product is a manual text field.
              You can enter or change the
              product anytime. Auto-imported
              leads can also fill this field.
            </p>
          </div>
        </div>

        {/* LEAD ASSIGNMENT */}

        <div
          className="card"
          style={{
            marginTop: 20,
          }}
        >
          <h2>Lead Assignment</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: 20,
            }}
          >
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
              >
                <option value="">
                  Unassigned
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
            </div>

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

        {/* NEXT FOLLOW-UP */}

        <div
          className="card"
          style={{
            marginTop: 20,
          }}
        >
          <h2>Next Follow-up</h2>

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

        {/* REMARKS */}

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
            rows={5}
            value={remarks}
            onChange={(e) =>
              setRemarks(
                e.target.value
              )
            }
            placeholder="Enter remarks, requirements, conversation notes..."
            style={{
              resize: "vertical",
            }}
          />
        </div>

        {/* ERROR */}

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

        {/* SUCCESS */}

        {success && (
          <div
            style={{
              marginTop: 20,
              padding: 15,
              borderRadius: 8,
              background: "#dcfce7",
              color: "#166534",
            }}
          >
            {success}
          </div>
        )}

        {/* BUTTONS */}

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
              ? "Updating..."
              : "Update Lead"}
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
