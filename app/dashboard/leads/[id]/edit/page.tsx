"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

type LeadStatus = "new" | "followup" | "won" | "lost";

type Lead = {
  id: string;
  customer_name: string | null;
  company_name: string | null;
  phone: string | number | null;
  email: string | null;
  city: string | null;
  product: string | null;
  source: string | null;
  status: LeadStatus | null;
};

export default function EditLeadPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;

  const [lead, setLead] = useState<Lead | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [product, setProduct] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState<LeadStatus>("new");

  useEffect(() => {
    if (id) {
      loadLead();
    }
  }, [id]);

  async function loadLead() {
    try {
      setLoading(true);
      setError("");

      /*
       * IMPORTANT:
       * supabaseBrowser is already a Supabase client.
       * DO NOT use supabaseBrowser().
       */
      const supabase = supabaseBrowser;

      const { data, error: leadError } = await supabase
        .from("leads")
        .select(
          `
          id,
          customer_name,
          company_name,
          phone,
          email,
          city,
          product,
          source,
          status
        `
        )
        .eq("id", id)
        .single();

      if (leadError) {
        throw leadError;
      }

      if (!data) {
        throw new Error("Lead not found");
      }

      const loadedLead = data as Lead;

      setLead(loadedLead);

      setCustomerName(loadedLead.customer_name ?? "");
      setCompanyName(loadedLead.company_name ?? "");
      setPhone(String(loadedLead.phone ?? ""));
      setEmail(loadedLead.email ?? "");
      setCity(loadedLead.city ?? "");
      setProduct(loadedLead.product ?? "");
      setSource(loadedLead.source ?? "");

      if (
        loadedLead.status === "new" ||
        loadedLead.status === "followup" ||
        loadedLead.status === "won" ||
        loadedLead.status === "lost"
      ) {
        setStatus(loadedLead.status);
      } else {
        setStatus("new");
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load lead"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      /*
       * IMPORTANT:
       * Again, no brackets.
       */
      const supabase = supabaseBrowser;

      const { error: updateError } = await supabase
        .from("leads")
        .update({
          customer_name: customerName.trim(),
          company_name: companyName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          city: city.trim(),
          product: product.trim(),
          source: source.trim(),
          status: status,
        })
        .eq("id", id);

      if (updateError) {
        throw updateError;
      }

      setMessage("Lead updated successfully.");

      setTimeout(() => {
        router.push("/dashboard/leads");
        router.refresh();
      }, 800);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update lead"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-8 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-gray-800 bg-gray-950 p-8">
            <p className="text-gray-400">
              Loading lead...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!lead && error) {
    return (
      <div className="min-h-screen bg-black p-8 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-red-800 bg-red-950/30 p-8">
            <h1 className="text-xl font-bold text-red-400">
              Unable to load lead
            </h1>

            <p className="mt-3 text-gray-300">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/dashboard/leads")
              }
              className="mt-6 rounded-lg bg-white px-5 py-3 font-semibold text-black"
            >
              Back to Leads
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 text-white md:p-8">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              MF INDIA CRM
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Edit Lead
            </h1>

            <p className="mt-2 text-gray-400">
              Update customer and lead information
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/dashboard/leads")
            }
            className="rounded-lg border border-gray-700 px-5 py-3 text-sm font-medium text-gray-200 hover:bg-gray-900"
          >
            ← Back to Leads
          </button>
        </div>

        {/* SUCCESS MESSAGE */}
        {message && (
          <div className="mb-6 rounded-lg border border-green-700 bg-green-950/40 px-5 py-4 text-green-400">
            {message}
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-700 bg-red-950/40 px-5 py-4 text-red-400">
            {error}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-800 bg-gray-950 p-5 md:p-8"
        >
          <div className="mb-8">
            <h2 className="text-xl font-semibold">
              Customer Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Update the lead details below.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            {/* CUSTOMER NAME */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Customer Name
              </label>

              <input
                type="text"
                value={customerName}
                onChange={(e) =>
                  setCustomerName(e.target.value)
                }
                placeholder="Enter customer name"
                className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-white"
              />
            </div>

            {/* COMPANY */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Company / Hospital
              </label>

              <input
                type="text"
                value={companyName}
                onChange={(e) =>
                  setCompanyName(e.target.value)
                }
                placeholder="Enter hospital/company"
                className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-white"
              />
            </div>

            {/* PHONE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Phone Number
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                placeholder="+91XXXXXXXXXX"
                className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-white"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="customer@example.com"
                className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-white"
              />
            </div>

            {/* CITY */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                City
              </label>

              <input
                type="text"
                value={city}
                onChange={(e) =>
                  setCity(e.target.value)
                }
                placeholder="Delhi"
                className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-white"
              />
            </div>

            {/* PRODUCT */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Product
              </label>

              <input
                type="text"
                value={product}
                onChange={(e) =>
                  setProduct(e.target.value)
                }
                placeholder="OT Table / ECG Machine"
                className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-white"
              />
            </div>

            {/* SOURCE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Lead Source
              </label>

              <select
                value={source}
                onChange={(e) =>
                  setSource(e.target.value)
                }
                className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
              >
                <option value="">
                  Select Source
                </option>

                <option value="Website">
                  Website
                </option>

                <option value="IndiaMART">
                  IndiaMART
                </option>

                <option value="TradeIndia">
                  TradeIndia
                </option>

                <option value="Reference">
                  Reference
                </option>

                <option value="WhatsApp">
                  WhatsApp
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            {/* STATUS */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Lead Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as LeadStatus
                  )
                }
                className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
              >
                <option value="new">
                  New
                </option>

                <option value="followup">
                  Follow-up
                </option>

                <option value="won">
                  Won
                </option>

                <option value="lost">
                  Lost
                </option>
              </select>
            </div>
          </div>

          {/* STATUS CARDS */}
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">

            <div className="rounded-lg border border-blue-900 bg-blue-950/30 p-4">
              <div className="font-semibold text-blue-400">
                New
              </div>
              <div className="mt-1 text-xs text-gray-500">
                New lead
              </div>
            </div>

            <div className="rounded-lg border border-yellow-900 bg-yellow-950/30 p-4">
              <div className="font-semibold text-yellow-400">
                Follow-up
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Follow-up required
              </div>
            </div>

            <div className="rounded-lg border border-green-900 bg-green-950/30 p-4">
              <div className="font-semibold text-green-400">
                Won
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Lead converted
              </div>
            </div>

            <div className="rounded-lg border border-red-900 bg-red-950/30 p-4">
              <div className="font-semibold text-red-400">
                Lost
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Lead closed
              </div>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="mt-10 flex flex-col-reverse gap-3 border-t border-gray-800 pt-6 sm:flex-row sm:justify-end">

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                router.push("/dashboard/leads")
              }
              className="rounded-lg border border-gray-700 px-6 py-3 font-medium text-gray-300 hover:bg-gray-900 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-white px-7 py-3 font-semibold text-black hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>
        </form>

        {/* LEAD ID */}
        <div className="mt-4 text-center text-xs text-gray-600">
          Lead ID: {lead?.id ?? id}
        </div>

      </div>
    </div>
  );
}
