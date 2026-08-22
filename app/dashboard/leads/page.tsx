"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
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
  email: string | null;
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
    typeof params.id === "string"
      ? params.id
      : "";

  const supabase = supabaseBrowser();

  const [agents, setAgents] =
    useState<Agent[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [customerName, setCustomerName] =
    useState("");

  const [companyName, setCompanyName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [city, setCity] =
    useState("");

  const [state, setState] =
    useState("");

  // MANUAL PRODUCT TEXT
  const [product, setProduct] =
    useState("");

  const [source, setSource] =
    useState("");

  const [assignedAgent, setAssignedAgent] =
    useState("");

  const [status, setStatus] =
    useState("new");

  const [remarks, setRemarks] =
    useState("");

  const [nextFollowUpDate, setNextFollowUpDate] =
    useState("");

  const [nextFollowUpTime, setNextFollowUpTime] =
    useState("");

  const [reminderEnabled, setReminderEnabled] =
    useState(true);

  useEffect(() => {
    async function loadData() {
      if (!leadId) return;

      setLoading(true);
      setError("");

      const [
        leadResult,
        agentsResult,
      ] = await Promise.all([
        supabase
          .from("leads")
          .select("*")
          .eq("id", leadId)
          .single(),

        supabase
          .from("agent_profiles")
          .select(
            "id, agent_name, is_active"
          )
          .eq("is_active", true)
          .order("agent_name"),
      ]);

      if (leadResult.error) {
        setError(
          leadResult.error.message
        );
        setLoading(false);
        return;
      }

      if (agentsResult.error) {
        setError(
          agentsResult.error.message
        );
        setLoading(false);
        return;
      }

      const lead =
        leadResult.data as Lead;

      setCustomerName(
        lead.customer_name || ""
      );

      setCompanyName(
        lead.company_name || ""
      );

      setPhone(
        lead.phone || ""
      );

      setEmail(
        lead.email || ""
      );

      setCity(
        lead.city || ""
      );

      setState(
        lead.state || ""
      );

      setProduct(
        lead.product || ""
      );

      setSource(
        lead.source || ""
      );

      setAssignedAgent(
        lead.assigned_agent_id ||
          lead.assigned_agent ||
          ""
      );

      setStatus(
        lead.lead_status ||
          lead.status ||
          "new"
      );

      setRemarks(
        lead.remarks ||
          lead.notes ||
          ""
      );

      if (lead.next_follow_up_date) {
        setNextFollowUpDate(
          lead.next_follow_up_date
        );
      } else if (lead.next_followup_at) {
        const d = new Date(
          lead.next_followup_at
        );

        setNextFollowUpDate(
          d.toISOString().slice(0, 10)
        );

        setNextFollowUpTime(
          d.toTimeString().slice(0, 5)
        );
      }

      if (lead.next_follow_up_time) {
        setNextFollowUpTime(
          lead.next_follow_up_time.slice(
            0,
            5
          )
        );
      }

      setReminderEnabled(
        lead.reminder_enabled !== false
      );

      setAgents(
        (agentsResult.data ??
          []) as Agent[]
      );

      setLoading(false);
    }

    loadData();
  }, [leadId]);

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

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
      let nextFollowupAt:
        | string
        | null = null;

      if (nextFollowUpDate) {
        const time =
          nextFollowUpTime ||
          "09:00";

        nextFollowupAt =
          new Date(
            `${nextFollowUpDate}T${time}:00`
          ).toISOString();
      }

      const { error } =
        await supabase
          .from("leads")
          .update({
            customer_name:
              customerName.trim(),

            company_name:
              companyName.trim() ||
              null,

            phone:
              phone.trim() || null,

            contact_no:
              phone.trim() || null,

            email:
              email.trim() || null,

            email_id:
              email.trim() || null,

            // PRODUCT IS MANUAL TEXT
            product:
              product.trim(),

            city:
              city.trim() || null,

            state:
              state.trim() || null,

            source:
              source.trim() || null,

            assigned_agent:
              assignedAgent ||
              null,

            assigned_agent_id:
              assignedAgent ||
              null,

            status,

            lead_status:
              status,

            remarks:
              remarks.trim() ||
              null,

            notes:
              remarks.trim() ||
              null,

            next_followup_at:
              nextFollowupAt,

            next_follow_up_date:
              nextFollowUpDate ||
              null,

            next_follow_up_time:
              nextFollowUpTime ||
              null,

            reminder_enabled:
              reminderEnabled,

            updated_at:
              new Date().toISOString(),
          })
          .eq("id", leadId);

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }

      router.push(
        "/dashboard/leads"
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update lead."
      );

      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main style={{ padding: 30 }}>
        <h1>Edit Lead</h1>
        <p>Loading lead...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 30 }}>

      {/* HEADER */}
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

        {/* FOLLOW-UP */}
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
              background:
                "#fee2e2",
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
          }}
        >
          <button
            type="submit"
            className="btn"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
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
    </main>
  );
}
