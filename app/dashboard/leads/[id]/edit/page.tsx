type Lead = {
  id: string;
  customer_name: string;
  company_name: string | null;
  phone: string | null;
  contact_no: string | null;   // ADD THIS
  email: string | null;
  email_id: string | null;    // ADD THIS
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
