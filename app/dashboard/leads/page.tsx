<td>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      minWidth: 130,
    }}
  >
    {agentId && agentMap.has(agentId) ? (
      <>
        {agents.find(
          (agent) => agent.id === agentId
        )?.photo_url ? (
          <img
            src={
              agents.find(
                (agent) =>
                  agent.id === agentId
              )?.photo_url ?? ""
            }
            alt={agentName}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              objectFit: "cover",
              border: "1px solid #ddd",
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
            }}
          >
            {agentName
              .charAt(0)
              .toUpperCase()}
          </div>
        )}

        <strong>
          {agentName}
        </strong>
      </>
    ) : (
      <span
        style={{
          color: "#94a3b8",
        }}
      >
        Unassigned
      </span>
    )}
  </div>
</td>
