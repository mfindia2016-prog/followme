export type Lead = {
  id: string;
  customer_name: string;
  company_name: string | null;
  phone: string | null;
  email: string | null;
  product_id: string | null;
  assigned_agent: string | null;
  status: "new" | "followup" | "won" | "lost";
  source: string | null;
  remarks: string | null;
  next_followup_at: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  category: string | null;
  sku: string | null;
  active: boolean;
};