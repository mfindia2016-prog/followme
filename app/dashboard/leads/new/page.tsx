const { error: insertError } = await supabase
  .from("leads")
  .insert({
    customer_name: customerName.trim(),
    company_name: companyName.trim() || null,
    phone: phone.trim() || null,
    contact_no: phone.trim() || null,
    email: email.trim() || null,
    email_id: email.trim() || null,

    product: product.trim(),

    city: city.trim() || null,
    state: state.trim() || null,

    source: source.trim() || null,

    // IMPORTANT: use agent_profiles.id
    assigned_agent_id: assignedAgent || null,

    status,
    lead_status: status,

    remarks: remarks.trim() || null,
    notes: remarks.trim() || null,

    next_followup_at: nextFollowupAt,
    next_follow_up_date: nextFollowUpDate || null,
    next_follow_up_time: nextFollowUpTime || null,

    reminder_enabled: reminderEnabled,

    created_by: user.id,
  });
