"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Agent = {
  id: string;
  agent_name: string;
  photo_url?: string | null;
  is_active?: boolean | null;
};

export default function NewLeadPage() {
  const router = useRouter();

  // IMPORTANT:
  // supabaseBrowser is already a Supabase client.
  // Do NOT use supabaseBrowser().
  const supabase = supabaseBrowser;

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

  // =====================================================
  // LOAD ACTIVE AGENTS
  // =====================================================

  useEffect(() => {
    async function loadAgents() {
      try {
        setLoadingAgents(true);

        const { data, error } = await supabase
          .from("agent_profiles")
          .select(
            "id, agent_name, photo_url, is_active"
          )
          .eq("is_active", true)
          .order("agent_name", {
            ascending: true,
          });

        if (error) {
          throw error;
        }

        setAgents((data ?? []) as Agent[]);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load agents."
        );
      } finally {
        setLoadingAgents(false);
      }
    }

    loadAgents();
  }, []);

  // =====================================================
  // SAVE LEAD
  // =====================================================

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

      // =================================================
      // FOLLOW-UP DATE/TIME
      // =================================================

      let nextFollowupAt: string | null = null;

      if (nextFollowUpDate) {
        const time =
          nextFollowUpTime || "09:00";

        nextFollowupAt = new Date(
          `${nextFollowUpDate}T${time}:00`
        ).toISOString();
      }

      // =================================================
      // INSERT LEAD
      // =================================================

      const { error: insertError } =
        await supabase
          .from("leads")
          .insert({
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

            product:
              product.trim(),

            city:
              city.trim() || null,

            state:
              state.trim() || null,

            source:
              source.trim() || null,

            // Agent UUID
            assigned_agent:
              assignedAgent || null,

            assigned_agent_id:
              assignedAgent || null,

            status,
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

            created_by:
              user.id,
          });

      if (insertError) {
        throw insertError;
      }

      // =================================================
      // SUCCESS
      // =================================================

      router.push("/dashboard/leads");
      router.refresh();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating the lead."
      );

      setSaving(false);
    }
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main
      style={{
        padding: 30,
        maxWidth: 1200,
        margin: "0 auto",
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
            New Lead
          </h1>

          <p
            style={{
              marginTop: 6,
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
          onClick={() =>
            router.push("/dashboard/leads")
          }
        >
          ← Back
        </button>
      </div>

      {/* CUSTOMER INFORMATION */}

      <div className="card">
        <h2>Customer Information</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
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
            <label>Email</label>

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
            <label>City</label>

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
            <label>State</label>

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
              setProduct(e.target.value)
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
            Product can be entered
            manually.
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
        <h2>Lead Assignment</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 20,
          }}
        >
          <div className="field">
            <label>Source</label>

            <input
              className="input"
              value={source}
              onChange={(e) =>
                setSource(e.target.value)
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
        <h2>Next Follow-up</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
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
            checked={reminderEnabled}
            onChange={(e) =>
              setReminderEnabled(
                e.target.checked
              )
            }
            id="reminder"
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
          value={remarks}
          onChange={(e) =>
            setRemarks(e.target.value)
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
            background: "#fee2e2",
            color: "#b91c1c",
            border:
              "1px solid #fecaca",
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
          flexWrap: "wrap",
        }}
      >
        <button
          type="submit"
          className="btn"
          disabled={saving}
          onClick={() => {
            const form =
              document.getElementById(
                "new-lead-form"
              ) as HTMLFormElement | null;

            form?.requestSubmit();
          }}
        >
          {saving
            ? "Saving..."
            : "Save Lead"}
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
    </main>
  );
}
