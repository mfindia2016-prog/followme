"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Agent = {
  id: string;
  agent_name: string;
  photo_url: string | null;
  mobile_no: string | null;
  is_active: boolean;
};

export default function Agents() {
  const supabase = supabaseBrowser();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  async function loadAgents() {
    setLoading(true);

    const { data, error } = await supabase
      .from("agent_profiles")
      .select("id, agent_name, photo_url, mobile_no, is_active")
      .order("agent_name");

    if (error) {
      alert("Unable to load agents: " + error.message);
    } else {
      setAgents(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAgents();
  }, []);

  async function updateAgent(
    id: string,
    field: "agent_name" | "mobile_no" | "is_active",
    value: string | boolean
  ) {
    setSaving(id);

    const { error } = await supabase
      .from("agent_profiles")
      .update({
        [field]: value,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      alert("Update failed: " + error.message);
    } else {
      setAgents((current) =>
        current.map((agent) =>
          agent.id === id
            ? { ...agent, [field]: value }
            : agent
        )
      );
    }

    setSaving(null);
  }

  async function uploadPhoto(id: string, file: File) {
    setSaving(id);

    const extension = file.name.split(".").pop() || "jpg";
    const fileName = `${id}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("agent-photos")
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      alert("Photo upload failed: " + uploadError.message);
      setSaving(null);
      return;
    }

    const { data } = supabase.storage
      .from("agent-photos")
      .getPublicUrl(fileName);

    const photoUrl = data.publicUrl;

    const { error: updateError } = await supabase
      .from("agent_profiles")
      .update({
        photo_url: photoUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      alert("Photo save failed: " + updateError.message);
    } else {
      setAgents((current) =>
        current.map((agent) =>
          agent.id === id
            ? { ...agent, photo_url: photoUrl }
            : agent
        )
      );
    }

    setSaving(null);
  }

  if (loading) {
    return (
      <main style={{ padding: 30 }}>
        <h1>Agent Management</h1>
        <p>Loading agents...</p>
      </main>
    );
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
          <h1 style={{ margin: 0 }}>Agent Management</h1>

          <p style={{ color: "#666" }}>
            Manage agents, photos, mobile numbers and status.
          </p>
        </div>

        <button
          onClick={loadAgents}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        {agents.map((agent) => (
          <div
            key={agent.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 14,
              padding: 20,
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 15,
                marginBottom: 20,
              }}
            >
              {agent.photo_url ? (
                <img
                  src={agent.photo_url}
                  alt={agent.agent_name}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #ddd",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    background: "#e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 25,
                    fontWeight: 700,
                  }}
                >
                  {agent.agent_name
                    ?.charAt(0)
                    ?.toUpperCase()}
                </div>
              )}

              <div>
                <strong style={{ fontSize: 18 }}>
                  {agent.agent_name}
                </strong>

                <div
                  style={{
                    marginTop: 5,
                    color: agent.is_active
                      ? "green"
                      : "red",
                    fontWeight: 600,
                  }}
                >
                  {agent.is_active
                    ? "Active"
                    : "Hold"}
                </div>
              </div>
            </div>

            <label
              style={{
                display: "block",
                marginBottom: 6,
              }}
            >
              Agent Name
            </label>

            <input
              value={agent.agent_name}
              onChange={(e) =>
                setAgents((current) =>
                  current.map((a) =>
                    a.id === agent.id
                      ? {
                          ...a,
                          agent_name:
                            e.target.value,
                        }
                      : a
                  )
                )
              }
              onBlur={(e) =>
                updateAgent(
                  agent.id,
                  "agent_name",
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: 10,
                border: "1px solid #ccc",
                borderRadius: 7,
                marginBottom: 15,
                boxSizing: "border-box",
              }}
            />

            <label
              style={{
                display: "block",
                marginBottom: 6,
              }}
            >
              Mobile Number
            </label>

            <input
              value={agent.mobile_no || ""}
              placeholder="+91XXXXXXXXXX"
              onChange={(e) =>
                setAgents((current) =>
                  current.map((a) =>
                    a.id === agent.id
                      ? {
                          ...a,
                          mobile_no:
                            e.target.value,
                        }
                      : a
                  )
                )
              }
              onBlur={(e) =>
                updateAgent(
                  agent.id,
                  "mobile_no",
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: 10,
                border: "1px solid #ccc",
                borderRadius: 7,
                marginBottom: 15,
                boxSizing: "border-box",
              }}
            />

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 15,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={agent.is_active}
                onChange={(e) =>
                  updateAgent(
                    agent.id,
                    "is_active",
                    e.target.checked
                  )
                }
              />

              {agent.is_active
                ? "Agent Active"
                : "Agent on Hold"}
            </label>

            <label
              style={{
                display: "block",
                padding: "10px 15px",
                borderRadius: 7,
                background: "#2563eb",
                color: "#fff",
                textAlign: "center",
                cursor: "pointer",
                marginBottom: 10,
              }}
            >
              📷 Change Photo

              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file =
                    e.target.files?.[0];

                  if (file) {
                    uploadPhoto(
                      agent.id,
                      file
                    );
                  }
                }}
              />
            </label>

            {saving === agent.id && (
              <p
                style={{
                  textAlign: "center",
                  color: "#666",
                  fontSize: 13,
                }}
              >
                Saving...
              </p>
            )}
          </div>
        ))}
      </div>

      {agents.length === 0 && (
        <div
          style={{
            padding: 30,
            textAlign: "center",
            border: "1px solid #ddd",
            borderRadius: 10,
          }}
        >
          No agents found.
        </div>
      )}
    </main>
  );
}
