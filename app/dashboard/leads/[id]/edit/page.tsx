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
    typeof params.id === "string" ? params.id : "";

  const [supabase] = useState(() => supabaseBrowser());

  const [loading, setLoading] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [saving, setSaving] = useState(false);

  const [lead, setLead] = useState<Lead | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [product, setProduct] = useState("");

  const [source, setSource] = useState("");
  const [assignedAgent, setAssignedAgent] = useState("");
  const [status, setStatus] = useState("new");

  const [remarks, setRemarks] = useState("");

  const [nextFollowUpDate, setNextFollowUpDate] = useState("");
  const [nextFollowUpTime, setNextFollowUpTime] = useState("");

  const [reminderEnabled, setReminderEnabled] = useState(true);

  // --------------------------------------------------
  // LOAD LEAD
  // --------------------------------------------------

  useEffect(() => {
    async function loadLead() {
      if (!leadId) {
        setError("Lead ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .single();

      if (fetchError) {
        setError(
          "Error loading lead: " + fetchError.message
        );
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Lead not found.");
        setLoading(false);
        return;
      }

      const currentLead = data as Lead;

      setLead(currentLead);

      setCustomerName(currentLead.customer_name || "");
      setCompanyName(currentLead.company_name || "");

      setPhone(
        currentLead.phone ||
          currentLead.contact_no ||
          ""
      );

      setEmail(
        currentLead.email ||
          currentLead.email_id ||
          ""
      );

      setCity(currentLead.city || "");
      setState(currentLead.state || "");

      setProduct(currentLead.product || "");

      setSource(currentLead.source || "");

      setAssignedAgent(
        currentLead.assigned_agent_id ||
          currentLead.assigned_agent ||
          ""
      );

      setStatus(
        currentLead.status ||
          currentLead.lead_status ||
          "new"
      );

      setRemarks(
        currentLead.remarks ||
          currentLead.notes ||
          ""
      );

      setReminderEnabled(
        currentLead.reminder_enabled !== false
      );

      if (currentLead.next_follow_up_date) {
        setNextFollowUpDate(
          currentLead.next_follow_up_date
        );
      }

      if (currentLead.next_follow_up_time) {
        setNextFollowUpTime(
          String(currentLead.next_follow_up_time).slice(
            0,
            5
          )
        );
      }

      if (
        !currentLead.next_follow_up_date &&
        currentLead.next_followup_at
      ) {
        const date = new Date(
          currentLead.next_followup_at
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

      setLoading(false);
    }

    loadLead();
  }, [leadId, supabase]);

  // --------------------------------------------------
  // LOAD AGENTS
  // --------------------------------------------------

  useEffect(() => {
    async function loadAgents() {
      setLoadingAgents(true);

      const { data, error: agentsError } =
        await supabase
          .from("agent_profiles")
          .select("id, agent_name, is_active")
          .eq("is_active", true)
          .order("agent_name", {
            ascending: true,
          });

      if (agentsError) {
        setError(
          "Error loading agents: " +
            agentsError.message
        );
      } else {
        setAgents((data || []) as Agent[]);
      }

      setLoadingAgents(false);
    }

    loadAgents();
  }, [supabase]);

  // --------------------------------------------------
  // UPDATE LEAD
  // --------------------------------------------------

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!leadId) {
      setError("Lead ID is missing.");
      return;
    }

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
      let nextFollowupAt: string | null = null;

      if (nextFollowUpDate) {
        const time = nextFollowUpTime || "09:00";

        const localDate = new Date(
          `${nextFollowUpDate}T${time}:00`
        );

        if (!Number.isNaN(localDate.getTime())) {
          nextFollowupAt =
            localDate.toISOString();
        }
      }

      const updateData = {
        customer_name: customerName.trim(),

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

        // MANUAL PRODUCT
        product: product.trim(),

        city:
          city.trim() || null,

        state:
          state.trim() || null,

        source:
          source.trim() || null,

        assigned_agent:
          assignedAgent || null,

        assigned_agent_id:
          assignedAgent || null,

        status: status,

        lead_status: status,

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

      const { error: updateError } =
        await supabase
          .from("leads")
          .update(updateData)
          .eq("id", leadId);

      if (updateError) {
        setError(
          "Failed to update lead: " +
            updateError.message
        );

        setSaving(false);
        return;
      }

      setMessage(
        "Lead updated successfully."
      );

      setSaving(false);

      setTimeout(() => {
        router.push("/dashboard/leads");
        router.refresh();
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while updating the lead."
      );

      setSaving(false);
    }
  }

  // --------------------------------------------------
  // LOADING SCREEN
  // --------------------------------------------------

  if (loading) {
    return (
      <main style={{ padding: 30 }}>
        <h1>Edit Lead</h1>

        <p>Loading lead...</p>

        {error && (
          <div
            style={{
              marginTop: 15,
              padding: 15,
              borderRadius: 8,
              background: "#fee2e2",
              color: "#b91c1c",
            }}
          >
            {error}
          </div>
        )}
      </main>
    );
  }

  // --------------------------------------------------
  // NOT FOUND
  // --------------------------------------------------

  if (!lead) {
    return (
      <main style={{ padding: 30 }}>
        <h1>Edit Lead</h1>

        <div
          style={{
            marginTop: 20,
            padding: 15,
            borderRadius: 8,
            background: "#fee2e2",
            color: "#b91c1c",
          }}
        >
          {error || "Lead not found."}
        </div>

        <button
          type="button"
          className="btn"
          style={{ marginTop: 20 }}
          onClick={() =>
            router.push("/dashboard/leads")
          }
        >
          ← Back to Leads
        </button>
      </main>
    );
  }

  // --------------------------------------------------
  // EDIT PAGE
  // --------------------------------------------------

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
            Edit Lead
          </h1>

          <p
            style={{
              marginTop: 6,
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
            router.push("/dashboard/leads")
          }
        >
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* CUSTOMER INFORMATION */}

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
                  setPhone(e.target.value)
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
                  setEmail(e.target.value)
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
                  setCity(e.target.value)
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
                  setState(e.target.value)
                }
                placeholder="State"
              />
            </div>
          </div>
        </div>

        {/* PRODUCT */}

        <div
          className="card"
          style={{ marginTop: 20 }}
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
                setProduct(e.target.value)
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
              You can change the product name
              anytime.
            </p>
          </div>
        </div>

        {/* ASSIGNMENT */}

        <div
          className="card"
          style={{ marginTop: 20 }}
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
                disabled={loadingAgents}
              >
                <option value="">
                  {loadingAgents
                    ? "Loading agents..."
                    : "Unassigned"}
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

            <div className="field">
              <label>
                Status
              </label>

              <select
                className="input"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
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

        {/* FOLLOW-UP */}

        <div
          className="card"
          style={{ marginTop: 20 }}
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
                value={nextFollowUpDate}
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
                value={nextFollowUpTime}
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
              checked={reminderEnabled}
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
          style={{ marginTop: 20 }}
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

        {/* SUCCESS */}

        {message && (
          <div
            style={{
              marginTop: 20,
              padding: 15,
              borderRadius: 8,
              background: "#dcfce7",
              color: "#166534",
            }}
          >
            {message}
          </div>
        )}

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

        {/* BUTTONS */}

        <div
          style={{
            marginTop: 25,
            display: "flex",
            gap: 12,
            marginBottom: 40,
          }}
        >
          <button
            type="submit"
            className="btn"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Update Lead"}
          </button>

          <button
            type="button"
            className="btn"
            style={{
              background: "#e2e8f0",
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
    </main>
  );
}
