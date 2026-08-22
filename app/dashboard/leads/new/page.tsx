// --------------------------------------------------
// CHECK SELECTED AGENT
// --------------------------------------------------

let selectedAgent: Agent | null = null;

if (assignedAgent) {
  selectedAgent =
    agents.find(
      (agent) => agent.id === assignedAgent
    ) ?? null;

  if (!selectedAgent) {
    setError(
      "Selected agent was not found. Please select an agent again."
    );
    setSaving(false);
    return;
  }
}

// --------------------------------------------------
// CREATE LEAD DATA
// --------------------------------------------------

const leadData = {
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

  product:
    product.trim(),

  city:
    city.trim() || null,

  state:
    state.trim() || null,

  source:
    source.trim() || null,

  // SAVE AGENT ID
  assigned_agent_id:
    selectedAgent?.id ?? null,

  // SAVE AGENT NAME
  assigned_agent:
    selectedAgent?.agent_name ?? null,

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

  created_by:
    user.id,
};

// --------------------------------------------------
// INSERT LEAD
// --------------------------------------------------

console.log(
  "SAVING LEAD:",
  leadData
);

const {
  data: insertedLead,
  error: insertError,
} = await supabase
  .from("leads")
  .insert(leadData)
  .select()
  .single();

if (insertError) {
  console.error(
    "LEAD INSERT ERROR:",
    insertError
  );

  setError(
    insertError.message
  );

  setSaving(false);
  return;
}

console.log(
  "LEAD CREATED:",
  insertedLead
);
