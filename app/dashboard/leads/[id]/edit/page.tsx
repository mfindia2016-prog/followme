"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Agent = {
  id: string;
  agent_name: string;
  is_active?: boolean;
};

type Lead = {
  id: string;
  customer_name: string;
  company_name: string | null;
  phone: string | null;
  contact_no: string | null;
  email: string | null;
  email_id: string | null;
  city: string | null;
  state: string | null;
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

export default function EditLeadPage() {
  const router = useRouter();
  const params = useParams();

  const leadId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : "";

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

  // MANUAL PRODUCT TEXT
  const [product, setProduct] = useState("");

  const [source, setSource] = useState("");
  const [assignedAgent, setAssignedAgent] = useState("");

  const [status, setStatus] = useState("new");
  const [remarks, setRemarks] = useState("");

  const [nextFollowUpDate, setNextFollowUpDate] = useState("");
  const [nextFollowUpTime, setNextFollowUpTime] = useState("");

  const [reminderEnabled, setReminderEnabled] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      if (!leadId) {
        setError("Lead ID is missing from the URL.");
        setLoading(false);
        return;
      }

      try {
        const supabase = supabaseBrowser();

        // -----------------------------------------
        // LOAD LEAD
        // -----------------------------------------

        const {
          data: lead,
          error: leadError,
        } = await supabase
          .from("leads")
          .select("*")
          .eq("id", leadId)
          .maybeSingle();

        if (leadError) {
          throw new Error(
            `Unable to load lead: ${leadError.message}`
          );
        }

        if (!lead) {
          throw new Error(
            "Lead not found. Please return to Leads and try again."
          );
        }

        // -----------------------------------------
        // LOAD AGENTS
        // -----------------------------------------

        const {
          data: agentData,
          error: agentError,
        } = await supabase
          .from("agent_profiles")
          .select("id, agent_name, is_active")
          .order("agent_name", {
            ascending: true,
          });

        if (agentError) {
          throw new Error(
            `Unable to load agents: ${agentError.message}`
          );
        }

        if (cancelled) return;

        // -----------------------------------------
        // SET AGENTS
        // -----------------------------------------

        setAgents((agentData ?? []) as Agent[]);

        // -----------------------------------------
        // SET CUSTOMER INFORMATION
        // -----------------------------------------

        setCustomerName(lead.customer_name ?? "");
        setCompanyName(lead.company_name ?? "");

        setPhone(
          lead.phone ??
            lead.contact_no ??
            ""
        );

        setEmail(
          lead.email ??
            lead.email_id ??
            ""
        );

        setCity(lead.city ?? "");
        setState(lead.state ?? "");

        // -----------------------------------------
        // PRODUCT
        // -----------------------------------------

        setProduct(lead.product ?? "");

        // -----------------------------------------
        // SOURCE
        // -----------------------------------------

        setSource(lead.source ?? "");

        // -----------------------------------------
        // AGENT
        // -----------------------------------------

        setAssignedAgent(
          lead.assigned_agent ??
            lead.assigned_agent_id ??
            ""
        );

        // -----------------------------------------
        // STATUS
        // -----------------------------------------

        setStatus(
          lead.status ??
            lead.lead_status ??
            "new"
        );

        // -----------------------------------------
        // NOTES
        // -----------------------------------------

        setRemarks(
          lead.remarks ??
            lead.notes ??
            ""
        );

        // -----------------------------------------
        // FOLLOW-UP DATE/TIME
        // -----------------------------------------

        if (lead.next_follow_up_date) {
          setNextFollowUpDate(
            lead.next_follow_up_date
          );
        } else if (lead.next_followup_at) {
          const d = new Date(
            lead.next_followup_at
          );

          if (!Number.isNaN(d.getTime())) {
            const year = d.getFullYear();
            const month = String(
              d.getMonth() + 1
            ).padStart(2, "0");
            const day = String(
              d.getDate()
            ).padStart(2, "0");

            setNextFollowUpDate(
              `${year}-${month}-${day}`
            );

            const hours = String(
              d.getHours()
            ).padStart(2, "0");

            const minutes = String(
              d.getMinutes()
            ).padStart(2, "0");

            setNextFollowUpTime(
              `${hours}:${minutes}`
            );
          }
        }

        if (lead.next_follow_up_time) {
          setNextFollowUpTime(
            String(
              lead.next_follow_up_time
            ).substring(0, 5)
          );
        }

        // -----------------------------------------
        // REMINDER
        // -----------------------------------------

        setReminderEnabled(
          lead.reminder_enabled !== false
        );

        setLoading(false);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load lead."
        );

        setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [leadId]);

  // -----------------------------------------
  // SAVE LEAD
  // -----------------------------------------

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!leadId) {
      setError("Lead ID is missing.");
      return;
    }

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
      const supabase = supabaseBrowser();

      // -----------------------------------------
      // CHECK LOGIN
      // -----------------------------------------

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError(
          "Your login session has expired. Please login again."
        );
        setSaving(false);
        return;
      }

      // -----------------------------------------
      // BUILD FOLLOW-UP TIMESTAMP
      // -----------------------------------------

      let nextFollowupAt:
        | string
        | null = null;

      if (nextFollowUpDate) {
        const time =
          nextFollowUpTime || "09:00";

        const localDate = new Date(
          `${nextFollowUpDate}T${time}:00`
        );

        if (
          !Number.isNaN(
            localDate.getTime()
          )
        ) {
          nextFollowupAt =
            localDate.toISOString();
        }
      }

      // -----------------------------------------
      // UPDATE
      // -----------------------------------------

      const updateData = {
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
      };

      const {
        error: updateError,
      } = await supabase
        .from("leads")
        .update(updateData)
        .eq("id", leadId);

      if (updateError) {
        throw new Error(
          updateError.message
        );
      }

      setSuccess(
        "Lead updated successfully."
      );

      // Go back to Leads after short delay
      setTimeout(() => {
        router.push(
          "/dashboard/leads"
        );
        router.refresh();
      }, 500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while updating the lead."
      );

      setSaving(false);
    }
  }

  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  if (loading) {
    return (
      <div>
        <h1>Edit Lead</h1>

        <div
          className="card"
          style={{
            marginTop: 20,
            padding: 25,
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#475569",
            }}
          >
            Loading lead...
          </p>
        </div>
      </div>
    );
  }

  // -----------------------------------------
  // ERROR BEFORE FORM
  // -----------------------------------------

  if (error && !customerName) {
    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: 25,
          }}
        >
          <div>
            <h1>Edit Lead</h1>
          </div>

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
            color: "#b91c1c",
            border:
              "1px solid #fecaca",
          }}
        >
          <strong>
            Error loading lead
          </strong>

          <p
            style={{
              marginBottom: 0,
            }}
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

  // -----------------------------------------
  // FORM
  // -----------------------------------------

  return (
    <div>
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: 25,
          gap: 15,
        }}
      >
        <div>
          <h1
            style={{
              marginBottom: 5,
            }}
          >
            Edit Lead
          </h1>

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
          onClick={() =>
            router.push(
              "/dashboard/leads"
            )
          }
          disabled={saving}
        >
          ← Back
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
      >
        {/* CUSTOMER */}

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
              <label>
                Email
              </label>

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
              <label>
                City
              </label>

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
              <label>
                State
              </label>

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
              Product is a manual text
              field. You can change it
              anytime. Auto-imported leads
              can also fill this field.
            </p>
          </div>
        </div>

        {/* ASSIGNMENT */}

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
            <div className="field">
              <label>
                Source
              </label>

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
                      {
                        agent.agent_name
                      }
                      {!agent.is_active
                        ? " (Inactive)"
                        : ""}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="field">
              <label>
                Status
              </label>

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

        {/* FOLLOW UP */}

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

        {/* NOTES */}

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

        {/* ERROR */}

        {error && (
          <div
            style={{
              marginTop: 20,
              padding: 15,
              borderRadius: 8,
              background:
                "#fee2e2",
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
              background:
                "#dcfce7",
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
            style={{
              background:
                "#e2e8f0",
              color: "#0f172a",
            }}
            onClick={() =>
              router.push(
                "/dashboard/leads"
              )
            }
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
