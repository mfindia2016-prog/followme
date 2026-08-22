<td>
  {agentName === "Unassigned" ? (
    <span
      style={{
        color: "#94a3b8",
        fontWeight: 500,
      }}
    >
      Unassigned
    </span>
  ) : (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        minWidth: 130,
      }}
    >
      {(() => {
        const agentId =
          lead.assigned_agent ||
          lead.assigned_agent_id;

        const agent = (agents ?? []).find(
          (a: any) => a.id === agentId
        );

        return agent?.photo_url ? (
          <img
            src={agent.photo_url}
            alt={agent.agent_name}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #e2e8f0",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              color: "#475569",
              flexShrink: 0,
            }}
          >
            {agentName
              .charAt(0)
              .toUpperCase()}
          </div>
        );
      })()}

      <strong>{agentName}</strong>
    </div>
  )}
</td>
