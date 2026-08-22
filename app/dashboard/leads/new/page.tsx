"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Agent = {
  id: string;
  agent_name: string;
  is_active?: boolean;
};

const statuses = [
  "new",
  "followup",
  "interested",
  "quotation",
  "won",
  "lost",
];

const sources = [
  "IndiaMART",
  "TradeIndia",
  "Website",
  "WhatsApp",
  "Reference",
  "Phone",
  "Other",
];

export default function NewLeadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [leadName, setLeadName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");

  // IMPORTANT:
  // Product is a free-text field, NOT a dropdown.
  const [product, setProduct] = useState("");

  const [source, setSource] = useState("");
  const [agentId, setAgentId] = useState("");
  const [status, setStatus] = useState("new");
  const [remarks, setRemarks] = useState("");

  const [followupDate, setFollowupDate] = useState("");
  const [followupTime, setFollowupTime] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(true);

  // Allows an external importer to open:
  // /dashboard/leads/new?product=Patient%20Monitor
  useEffect(() => {
    const fetchedProduct = searchParams.get("product");

    if (fetchedProduct) {
      setProduct(fetchedProduct);
    }
  }, [searchParams]);

  // Load active agents
  useEffect(() => {
    async function loadAgents() {
      setLoadingAgents(true);

      const sb = supabaseBrowser();

      const { data, error } = await sb
        .from("agent_profiles")
        .select("id, agent_name, is_active")
        .eq("is_active", true)
        .order("agent_name", { ascending: true });

      if (error) {
        setError("Unable to load agents: " + error.message);
      } else {
        setAgents((data ?? []) as Agent[]);
      }

      setLoadingAgents(false);
    }

    loadAgents();
  }, []);

  async function saveLead(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (!leadName.trim()) {
      setError("Customer name is required.");
      return;
    }

    setSaving(true);

    const sb = supabaseBrowser();

    let nextFollowupAt: string | null = null;

    if (followupDate) {
      const time = followupTime || "09:00";
      nextFollowupAt = `${followupDate}T${time}:00`;
    }

    const { error: insertError } = await sb.from("leads").insert({
      lead_name: leadName.trim(),
      company_name: companyName.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      city: city.trim() || null,

      // Product is saved as normal text.
      product: product.trim() || null,

      source: source || null,

      // Existing CRM schema uses agent name/text.
      agent_id: agentId || null,

      status,
      remarks: remarks.trim() || null,
      next_followup_at: nextFollowupAt,
      reminder_enabled: reminderEnabled,
    });

    setSaving(false);

    if (insertError) {
      setError("Unable to save lead: " + insertError.message);
      return;
    }

    router.push("/dashboard/leads");
    router.refresh();
  }

  return (
    <div style={{ maxWidth: 1000 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 25,
        }}
      >
        <div>
          <h1 style={{ marginBottom: 5 }}>New Lead</h1>
          <p style={{ margin: 0, color: "#667085" }}>
            Add a new customer lead and schedule follow-up.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard/leads")}
          style={{
            padding: "11px 20px",
            border: "0",
            borderRadius: 8,
            background: "#e9eef5",
            color: "#102a43",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
      </div>

      <form
        onSubmit={saveLead}
        style={{
          background: "#fff",
          border: "1px solid #dfe5ec",
          borderRadius: 14,
          padding: 28,
          boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
        }}
      >
        {error && (
          <div
            style={{
              background: "#feecec",
              color: "#c62828",
              padding: 13,
              borderRadius: 8,
              marginBottom: 20,
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        {/* CUSTOMER INFORMATION */}

        <h2 style={{ marginBottom: 18 }}>Customer Information</h2>

        <div style={gridStyle}>
          <Field label="Customer Name *">
            <input
              className="input"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              placeholder="Customer name"
              required
            />
          </Field>

          <Field label="Company Name">
            <input
              className="input"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Company name"
            />
          </Field>

          <Field label="Mobile Number">
            <input
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91XXXXXXXXXX"
            />
          </Field>

          <Field label="Email">
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@email.com"
            />
          </Field>

          <Field label="City">
            <input
              className="input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
            />
          </Field>
        </div>

        {/* PRODUCT */}

        <h2 style={{ marginTop: 32, marginBottom: 18 }}>Product</h2>

        <Field label="Product Name">
          <input
            className="input"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Type product name"
          />

          <div
            style={{
              marginTop: 7,
              fontSize: 13,
              color: "#667085",
            }}
          >
            Product is manual text. Imported leads can automatically provide
            the product name.
          </div>
        </Field>

        {/* LEAD ASSIGNMENT */}

        <h2 style={{ marginTop: 32, marginBottom: 18 }}>
          Lead Assignment
        </h2>

        <div style={gridStyle}>
          <Field label="Source">
            <select
              className="input"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option value="">Select source</option>

              {sources.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Assign Agent">
            <select
              className="input"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              disabled={loadingAgents}
            >
              <option value="">
                {loadingAgents ? "Loading agents..." : "Select agent"}
              </option>

              {agents.map((agent) => (
                <option key={agent.id} value={agent.agent_name}>
                  {agent.agent_name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Status">
            <select
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item.toUpperCase()}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* FOLLOW-UP */}

        <h2 style={{ marginTop: 32, marginBottom: 18 }}>
          Follow-up
        </h2>

        <div style={gridStyle}>
          <Field label="Next Follow-up Date">
            <input
              className="input"
              type="date"
              value={followupDate}
              onChange={(e) => setFollowupDate(e.target.value)}
            />
          </Field>

          <Field label="Next Follow-up Time">
            <input
              className="input"
              type="time"
              value={followupTime}
              onChange={(e) => setFollowupTime(e.target.value)}
            />
          </Field>
        </div>

        <div style={{ marginTop: 20 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
              style={{
                width: 18,
                height: 18,
              }}
            />

            🔔 Reminder ON
          </label>
        </div>

        {/* REMARKS */}

        <h2 style={{ marginTop: 32, marginBottom: 18 }}>Remarks</h2>

        <textarea
          className="input"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Enter customer requirement, discussion, quotation details, etc."
          rows={5}
          style={{
            width: "100%",
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />

        {/* BUTTONS */}

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 30,
          }}
        >
          <button
            type="submit"
            className="btn"
            disabled={saving}
            style={{
              minWidth: 150,
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving..." : "Save Lead"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard/leads")}
            style={{
              minWidth: 120,
              padding: "12px 20px",
              border: "0",
              borderRadius: 8,
              background: "#e9eef5",
              color: "#102a43",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label
        style={{
          display: "block",
          marginBottom: 7,
          fontWeight: 600,
        }}
      >
        {label}
      </label>

      {children}
    </div>
  );
}

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 20,
};
