"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase-browser";

type LeadRow = {
  id?: string;
  customer_name?: string;
  company_name?: string;
  phone?: string | number;
  email?: string;
  city?: string;
  product?: string;
  source?: string;
  status?: string;
};

const ALLOWED_STATUS = ["new", "followup", "won", "lost"];

function clean(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalizeStatus(value: unknown): string {
  const status = clean(value).toLowerCase();

  if (ALLOWED_STATUS.includes(status)) {
    return status;
  }

  return "new";
}

export default function ImportLeadsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // READ EXCEL / CSV
  // =====================================================

  async function handleFile(file: File) {
    setFile(file);
    setRows([]);
    setMessage("");
    setError("");

    try {
      const buffer = await file.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
      });

      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

      const data = XLSX.utils.sheet_to_json<LeadRow>(
        firstSheet,
        {
          defval: "",
        }
      );

      if (!data.length) {
        setError("File is empty.");
        return;
      }

      setRows(data);
      setMessage(`${data.length} leads found in file.`);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to read this Excel/CSV file."
      );
    }
  }

  // =====================================================
  // FILE CHANGE
  // =====================================================

  function onFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selected = event.target.files?.[0];

    if (!selected) return;

    handleFile(selected);
  }

  // =====================================================
  // IMPORT INTO SUPABASE
  // =====================================================

  async function importLeads() {
    if (!rows.length) {
      setError("Please select an Excel or CSV file first.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const supabase = createClient();

      // -------------------------------------------------
      // PREPARE DATA
      // -------------------------------------------------

      const leads = rows.map((row, index) => {
        const phoneText = clean(row.phone);

        return {
          id:
            clean(row.id) ||
            `IMPORT-${Date.now()}-${index + 1}`,

          customer_name:
            clean(row.customer_name) ||
            "Unknown Customer",

          company_name:
            clean(row.company_name),

          phone: phoneText
            ? Number(phoneText.replace(/\D/g, ""))
            : null,

          email:
            clean(row.email),

          city:
            clean(row.city),

          product:
            clean(row.product),

          source:
            clean(row.source) ||
            "Excel Import",

          status:
            normalizeStatus(row.status),
        };
      });

      // -------------------------------------------------
      // INSERT IN BATCHES
      // -------------------------------------------------

      const batchSize = 100;

      let imported = 0;

      for (
        let i = 0;
        i < leads.length;
        i += batchSize
      ) {
        const batch = leads.slice(
          i,
          i + batchSize
        );

        const { error: insertError } =
          await supabase
            .from("leads")
            .insert(batch);

        if (insertError) {
          throw insertError;
        }

        imported += batch.length;
      }

      setMessage(
        `Successfully imported ${imported} leads.`
      );

      setRows([]);
      setFile(null);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Import failed. Please check your CSV/Excel columns."
      );
    } finally {
      setLoading(false);
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
          gap: 15,
          flexWrap: "wrap",
          marginBottom: 25,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 30,
            }}
          >
            Import Leads
          </h1>

          <p
            style={{
              color: "#64748b",
              marginTop: 6,
            }}
          >
            Upload Excel or CSV file into your CRM
          </p>
        </div>

        <a
          href="/dashboard/leads"
          className="btn"
          style={{
            textDecoration: "none",
          }}
        >
          ← Back to Leads
        </a>
      </div>

      {/* UPLOAD BOX */}

      <div
        style={{
          border: "2px dashed #cbd5e1",
          borderRadius: 14,
          padding: 35,
          background: "#f8fafc",
          textAlign: "center",
          marginBottom: 25,
        }}
      >
        <h2
          style={{
            marginTop: 0,
          }}
        >
          Upload Excel / CSV
        </h2>

        <p
          style={{
            color: "#64748b",
          }}
        >
          Select .xlsx, .xls or .csv file
        </p>

        <label
          style={{
            display: "inline-block",
            padding: "12px 22px",
            background: "#2563eb",
            color: "#fff",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Choose File

          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={onFileChange}
            style={{
              display: "none",
            }}
          />
        </label>

        {file && (
          <div
            style={{
              marginTop: 15,
              fontWeight: 600,
            }}
          >
            Selected: {file.name}
          </div>
        )}
      </div>

      {/* SUCCESS */}

      {message && (
        <div
          style={{
            padding: 15,
            marginBottom: 20,
            borderRadius: 8,
            background: "#dcfce7",
            color: "#166534",
            border: "1px solid #86efac",
            fontWeight: 600,
          }}
        >
          {message}
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div
          style={{
            padding: 15,
            marginBottom: 20,
            borderRadius: 8,
            background: "#fee2e2",
            color: "#991b1b",
            border: "1px solid #fca5a5",
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      {/* EXPECTED COLUMNS */}

      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: 20,
          marginBottom: 25,
        }}
      >
        <h3
          style={{
            marginTop: 0,
          }}
        >
          Excel Column Names
        </h3>

        <p
          style={{
            color: "#64748b",
          }}
        >
          Your first row should contain these headers:
        </p>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {[
            "id",
            "customer_name",
            "company_name",
            "phone",
            "email",
            "city",
            "product",
            "source",
            "status",
          ].map((column) => (
            <span
              key={column}
              style={{
                padding: "7px 10px",
                background: "#eff6ff",
                color: "#1d4ed8",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {column}
            </span>
          ))}
        </div>

        <p
          style={{
            marginBottom: 0,
            marginTop: 15,
            color: "#64748b",
            fontSize: 13,
          }}
        >
          Valid status values:{" "}
          <strong>
            new, followup, won, lost
          </strong>
        </p>
      </div>

      {/* PREVIEW */}

      {rows.length > 0 && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 25,
          }}
        >
          <div
            style={{
              padding: 18,
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <h3
              style={{
                margin: 0,
              }}
            >
              Preview
            </h3>

            <strong>
              {rows.length} leads
            </strong>
          </div>

          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 900,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f8fafc",
                  }}
                >
                  <th style={thStyle}>
                    Customer
                  </th>

                  <th style={thStyle}>
                    Company
                  </th>

                  <th style={thStyle}>
                    Phone
                  </th>

                  <th style={thStyle}>
                    Email
                  </th>

                  <th style={thStyle}>
                    City
                  </th>

                  <th style={thStyle}>
                    Product
                  </th>

                  <th style={thStyle}>
                    Source
                  </th>

                  <th style={thStyle}>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows
                  .slice(0, 25)
                  .map((row, index) => (
                    <tr key={index}>
                      <td style={tdStyle}>
                        {clean(
                          row.customer_name
                        ) || "-"}
                      </td>

                      <td style={tdStyle}>
                        {clean(
                          row.company_name
                        ) || "-"}
                      </td>

                      <td style={tdStyle}>
                        {clean(row.phone) || "-"}
                      </td>

                      <td style={tdStyle}>
                        {clean(row.email) || "-"}
                      </td>

                      <td style={tdStyle}>
                        {clean(row.city) || "-"}
                      </td>

                      <td style={tdStyle}>
                        {clean(row.product) || "-"}
                      </td>

                      <td style={tdStyle}>
                        {clean(row.source) ||
                          "Excel Import"}
                      </td>

                      <td style={tdStyle}>
                        {normalizeStatus(
                          row.status
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {rows.length > 25 && (
            <div
              style={{
                padding: 12,
                color: "#64748b",
                fontSize: 13,
              }}
            >
              Showing first 25 rows of{" "}
              {rows.length} total rows.
            </div>
          )}
        </div>
      )}

      {/* IMPORT BUTTON */}

      {rows.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={() => {
              setRows([]);
              setFile(null);
              setMessage("");
              setError("");
            }}
            disabled={loading}
            style={{
              padding: "12px 20px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              background: "#fff",
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            Clear
          </button>

          <button
            type="button"
            onClick={importLeads}
            disabled={loading}
            style={{
              padding: "12px 24px",
              borderRadius: 8,
              border: "none",
              background: loading
                ? "#94a3b8"
                : "#16a34a",
              color: "#fff",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontWeight: 700,
            }}
          >
            {loading
              ? "Importing..."
              : `Import ${rows.length} Leads`}
          </button>
        </div>
      )}
    </main>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 14px",
  borderBottom: "1px solid #e2e8f0",
  fontSize: 13,
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: "1px solid #f1f5f9",
  fontSize: 14,
  whiteSpace: "nowrap",
};
