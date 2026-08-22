"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Agent = {
  id: string;
  agent_name: string;
  is_active?: boolean;
};

type ImportedLead = {
  customer_name: string;
  company_name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  product: string;
  source: string | null;
  agent_name: string | null;
  status: string;
  next_follow_up_date: string | null;
  next_follow_up_time: string | null;
  remarks: string | null;
};

export default function ImportLeadsPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ImportedLead[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadAgents() {
    const { data, error } = await supabase
      .from("agent_profiles")
      .select("id, agent_name, is_active")
      .eq("is_active", true)
      .order("agent_name", { ascending: true });

    if (error) {
      setError("Could not load agents: " + error.message);
      return;
    }

    setAgents((data ?? []) as Agent[]);
  }

  function getValue(row: any, names: string[]) {
    for (const name of names) {
      if (
        row[name] !== undefined &&
        row[name] !== null &&
        String(row[name]).trim() !== ""
      ) {
        return String(row[name]).trim();
      }
    }

    return "";
  }

  function excelDateToString(value: any) {
    if (!value) return null;

    if (typeof value === "number") {
      const date = XLSX.SSF.parse_date_code(value);

      if (date) {
        const month = String(date.m).padStart(2, "0");
        const day = String(date.d).padStart(2, "0");

        return `${date.y}-${month}-${day}`;
      }
    }

    const text = String(value).trim();

    if (!text) return null;

    return text;
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);
    setRows([]);
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await loadAgents();

      const buffer = await selectedFile.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
      });

      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        setError("Excel file has no worksheet.");
        setLoading(false);
        return;
      }

      const worksheet = workbook.Sheets[sheetName];

      const data = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
      });

      const imported: ImportedLead[] = (data as any[]).map((row) => ({
        customer_name: getValue(row, [
          "Customer Name",
          "customer_name",
          "Customer",
          "Name",
        ]),

        company_name:
          getValue(row, [
            "Company Name",
            "company_name",
            "Company",
          ]) || null,

        phone:
          getValue(row, [
            "Phone",
            "Mobile",
            "Mobile Number",
            "phone",
            "contact_no",
          ]) || null,

        email:
          getValue(row, [
            "Email",
            "email",
            "Email ID",
          ]) || null,

        city:
          getValue(row, [
            "City",
            "city",
          ]) || null,

        state:
          getValue(row, [
            "State",
            "state",
          ]) || null,

        product: getValue(row, [
          "Product",
          "Product Name",
          "product",
        ]),

        source:
          getValue(row, [
            "Source",
            "source",
          ]) || null,

        agent_name:
          getValue(row, [
            "Agent",
            "Agent Name",
            "agent_name",
            "Assigned Agent",
          ]) || null,

        status:
          getValue(row, [
            "Status",
            "status",
          ]) || "new",

        next_follow_up_date:
          excelDateToString(
            row["Follow-up Date"] ??
              row["Follow Up Date"] ??
              row["next_follow_up_date"]
          ),

        next_follow_up_time:
          getValue(row, [
            "Follow-up Time",
            "Follow Up Time",
            "next_follow_up_time",
          ]) || null,

        remarks:
          getValue(row, [
            "Remarks",
            "Notes",
            "remarks",
            "notes",
          ]) || null,
      }));

      setRows(imported);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not read Excel file."
      );
    }

    setLoading(false);
  }

  async function importLeads() {
    if (rows.length === 0) {
      setError("Please select an Excel file first.");
      return;
    }

    setImporting(true);
    setError("");
    setSuccess("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Please login again.");
        setImporting(false);
        return;
      }

      const { data: currentAgents, error: agentError } =
        await supabase
          .from("agent_profiles")
          .select("id, agent_name, is_active")
          .eq("is_active", true);

      if (agentError) {
        setError(
          "Could not load agents: " +
            agentError.message
        );
        setImporting(false);
        return;
      }

      const agentList = (currentAgents ?? []) as Agent[];

      const findAgent = (agentName: string | null) => {
        if (!agentName) return null;

        const searchName = agentName
          .trim()
          .toLowerCase();

        const agent = agentList.find(
          (a) =>
            a.agent_name.trim().toLowerCase() ===
            searchName
        );

        return agent ?? null;
      };

      const leadsToInsert = rows
        .filter((row) => row.customer_name.trim())
        .map((row) => {
          const agent = findAgent(row.agent_name);

          let nextFollowupAt: string | null = null;

          if (row.next_follow_up_date) {
            const time =
              row.next_follow_up_time || "09:00";

            const parsed = new Date(
              `${row.next_follow_up_date}T${time}:00`
            );

            if (!Number.isNaN(parsed.getTime())) {
              nextFollowupAt =
                parsed.toISOString();
            }
          }

          return {
            customer_name:
              row.customer_name.trim(),

            company_name:
              row.company_name || null,

            phone:
              row.phone || null,

            contact_no:
              row.phone || null,

            email:
              row.email || null,

            email_id:
              row.email || null,

            city:
              row.city || null,

            state:
              row.state || null,

            product:
              row.product || null,

            source:
              row.source || "Excel",

            assigned_agent:
              agent?.id || null,

            assigned_agent_id:
              agent?.id || null,

            status:
              row.status || "new",

            lead_status:
              row.status || "new",

            remarks:
              row.remarks || null,

            notes:
              row.remarks || null,

            next_followup_at:
              nextFollowupAt,

            next_follow_up_date:
              row.next_follow_up_date || null,

            next_follow_up_time:
              row.next_follow_up_time || null,

            reminder_enabled:
              Boolean(nextFollowupAt),

            created_by:
              user.id,
          };
        });

      if (leadsToInsert.length === 0) {
        setError(
          "No valid leads found in the Excel file."
        );
        setImporting(false);
        return;
      }

      const { error: insertError } =
        await supabase
          .from("leads")
          .insert(leadsToInsert);

      if (insertError) {
        setError(
          "Import failed: " +
            insertError.message
        );
        setImporting(false);
        return;
      }

      const assignedCount =
        leadsToInsert.filter(
          (lead) =>
            lead.assigned_agent_id !== null
        ).length;

      const unassignedCount =
        leadsToInsert.length -
        assignedCount;

      setSuccess(
        `${leadsToInsert.length} leads imported successfully. ` +
          `${assignedCount} assigned to agents, ` +
          `${unassignedCount} unassigned.`
      );

      setTimeout(() => {
        router.push("/dashboard/leads");
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Import failed."
      );
    }

    setImporting(false);
  }

  return (
    <main style={{ padding: 30 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 25,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>
            Import Leads from Excel
          </h1>

          <p
            style={{
              color: "#64748b",
              marginTop: 6,
            }}
          >
            Upload your Excel file and import
            leads directly into the CRM.
          </p>
        </div>

        <button
          className="btn"
          onClick={() =>
            router.push("/dashboard/leads")
          }
        >
          ← Back
        </button>
      </div>

      <div
        className="card"
        style={{
          padding: 25,
          marginBottom: 20,
        }}
      >
        <h2>1. Select Excel File</h2>

        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFile}
          style={{
            marginTop: 15,
          }}
        />

        {file && (
          <p
            style={{
              marginTop: 10,
              color: "#475569",
            }}
          >
            Selected: <strong>{file.name}</strong>
          </p>
        )}
      </div>

      <div
        className="card"
        style={{
          padding: 25,
          marginBottom: 20,
        }}
      >
        <h2>Excel Columns</h2>

        <p style={{ color: "#64748b" }}>
          Your Excel can contain these columns:
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {[
            "Customer Name",
            "Company Name",
            "Phone",
            "Email",
            "City",
            "State",
            "Product",
            "Source",
            "Agent",
            "Status",
            "Follow-up Date",
            "Follow-up Time",
            "Remarks",
          ].map((column) => (
            <span
              key={column}
              style={{
                padding: "7px 10px",
                borderRadius: 6,
                background: "#f1f5f9",
                color: "#334155",
                fontSize: 13,
              }}
            >
              {column}
            </span>
          ))}
        </div>

        <p
          style={{
            marginTop: 15,
            color: "#64748b",
          }}
        >
          <strong>Agent:</strong> Enter the
          agent name, for example Rahul, Sania,
          Maryam, Meenakshi or Zaina. The CRM
          will automatically find the agent ID.
        </p>
      </div>

      {loading && (
        <div
          style={{
            padding: 15,
            marginBottom: 20,
            borderRadius: 8,
            background: "#e0f2fe",
            color: "#0369a1",
          }}
        >
          Reading Excel file...
        </div>
      )}

      {rows.length > 0 && (
        <div
          className="card"
          style={{
            padding: 25,
            marginBottom: 20,
          }}
        >
          <h2>
            2. Preview ({rows.length} Leads)
          </h2>

          <div
            style={{
              overflowX: "auto",
              marginTop: 15,
            }}
          >
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Company</th>
                  <th>Phone</th>
                  <th>Product</th>
                  <th>Agent</th>
                  <th>Status</th>
                  <th>Follow-up</th>
                </tr>
              </thead>

              <tbody>
                {rows.slice(0, 100).map(
                  (row, index) => {
                    const agent = agents.find(
                      (a) =>
                        a.agent_name
                          .trim()
                          .toLowerCase() ===
                        (row.agent_name ?? "")
                          .trim()
                          .toLowerCase()
                    );

                    return (
                      <tr key={index}>
                        <td>
                          {row.customer_name ||
                            "-"}
                        </td>

                        <td>
                          {row.company_name ||
                            "-"}
                        </td>

                        <td>
                          {row.phone || "-"}
                        </td>

                        <td>
                          {row.product || "-"}
                        </td>

                        <td>
                          {row.agent_name ? (
                            <strong
                              style={{
                                color: agent
                                  ? "green"
                                  : "red",
                              }}
                            >
                              {row.agent_name}
                              {agent
                                ? " ✓"
                                : " — not found"}
                            </strong>
                          ) : (
                            "Unassigned"
                          )}
                        </td>

                        <td>
                          {row.status}
                        </td>

                        <td>
                          {row.next_follow_up_date ||
                            "-"}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>

          {rows.length > 100 && (
            <p
              style={{
                color: "#64748b",
                marginTop: 10,
              }}
            >
              Showing first 100 rows as
              preview. All {rows.length} rows
              will be imported.
            </p>
          )}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: 15,
            marginBottom: 20,
            borderRadius: 8,
            background: "#fee2e2",
            color: "#b91c1c",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: 15,
            marginBottom: 20,
            borderRadius: 8,
            background: "#dcfce7",
            color: "#166534",
          }}
        >
          {success}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 12,
        }}
      >
        <button
          className="btn"
          onClick={importLeads}
          disabled={
            importing ||
            loading ||
            rows.length === 0
          }
        >
          {importing
            ? "Importing..."
            : `Import ${rows.length || ""} Leads`}
        </button>

        <button
          className="btn"
          style={{
            background: "#e2e8f0",
            color: "#0f172a",
          }}
          onClick={() =>
            router.push("/dashboard/leads")
          }
          disabled={importing}
        >
          Cancel
        </button>
      </div>
    </main>
  );
}
