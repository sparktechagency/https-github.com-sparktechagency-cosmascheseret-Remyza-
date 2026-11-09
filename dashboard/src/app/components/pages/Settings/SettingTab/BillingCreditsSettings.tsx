"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api";
import type { ApiEnvelope } from "@/types/admin";

type CreditSettings = {
  enforcement_mode: "shadow" | "enforce";
  sms_outbound_per_segment: number;
  sms_inbound_per_message: number;
  mms_outbound: number;
  mms_inbound: number;
  whatsapp_inbound_conversation: number;
  whatsapp_outbound_conversation: number;
  whatsapp_window_hours: number;
  email_outbound: number;
  email_inbound: number;
  rollover_enabled: boolean;
  rollover_months: number;
  renewal_grace_hours: number;
  low_balance_threshold_percent: number;
  low_balance_email_enabled: boolean;
  exhausted_email_enabled: boolean;
  trial_enabled: boolean;
  trial_credits: number;
  trial_credit_expiry_days: number | null;
  demo_enabled: boolean;
  demo_daily_message_cap: number;
  paused_followup_max_age_days: number;
  number_retention_days_after_lapse: number;
  topups_require_active_subscription: boolean;
  sandbox_purchase_policy: string;
  sandbox_allows_number_provisioning: boolean;
  apple_commission_percent: string;
  google_commission_percent: string;
  number_setup_eta_text: string;
  terms_url: string;
  privacy_url: string;
  account_deletion_url: string;
};

type BillingPlan = { id: number; name: string; description: string; monthly_credits: number; dedicated_numbers: number; features: string[]; reference_price_usd: string; setup_fee_enabled: boolean; free_setup_badge_enabled: boolean; free_setup_badge_text: string; is_active: boolean };
type StoreProduct = { id: number; code: string; kind: string; apple_product_id: string; google_product_id: string; google_base_plan_id: string; credits: number; reference_price_usd: string; badge_text: string; is_active: boolean; sort_order: number };

export default function BillingCreditsSettings() {
  const [settings, setSettings] = useState<CreditSettings | null>(null);
  const [plan, setPlan] = useState<BillingPlan | null>(null);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      apiRequest<ApiEnvelope<CreditSettings>>("admin/billing/settings/"),
      apiRequest<BillingPlan[]>("admin/billing/plans/"),
      apiRequest<StoreProduct[]>("admin/billing/products/"),
    ]).then(([settingsResponse, plans, storeProducts]) => {
      setSettings(settingsResponse.data);
      setPlan(plans[0] || null);
      setProducts(storeProducts);
    }).catch((error) => setMessage(error instanceof Error ? error.message : "Unable to load billing settings."));
  }, []);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!settings) return;
    if (settings.enforcement_mode === "enforce" && !window.confirm("Enable live credit enforcement? Sending will pause when a wallet reaches zero.")) return;
    setSaving(true); setMessage("");
    try {
      const settingsResponse = await apiRequest<ApiEnvelope<CreditSettings>>("admin/billing/settings/", { method: "PATCH", body: JSON.stringify(settings) });
      setSettings(settingsResponse.data);
      if (plan) {
        const updatedPlan = await apiRequest<BillingPlan>(`admin/billing/plans/${plan.id}/`, { method: "PATCH", body: JSON.stringify(plan) });
        setPlan(updatedPlan);
      }
      setMessage("Billing and credit settings saved.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save settings."); }
    finally { setSaving(false); }
  };

  const saveProduct = async (product: StoreProduct) => {
    try {
      const updated = await apiRequest<StoreProduct>(`admin/billing/products/${product.id}/`, { method: "PATCH", body: JSON.stringify(product) });
      setProducts((items) => items.map((item) => item.id === updated.id ? updated : item));
      setMessage(`${product.code} updated. Store prices must still be changed in Apple and Google consoles.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to update product."); }
  };

  if (!settings) return <section className="rounded-2xl border bg-white p-8">{message || "Loading billing settings..."}</section>;
  const set = <K extends keyof CreditSettings>(key: K, value: CreditSettings[K]) => setSettings((current) => current ? { ...current, [key]: value } : current);
  const setPlanField = <K extends keyof BillingPlan>(key: K, value: BillingPlan[K]) => setPlan((current) => current ? { ...current, [key]: value } : current);

  return <div className="space-y-6">
    <form onSubmit={save} className="space-y-6">
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"><strong>Store-controlled pricing:</strong> Apple and Google determine the customer-facing localized price. Reference prices here are for analytics only and never change what an existing subscriber pays.</section>
      {plan && <Card title="Chesera Pro plan">
        <Grid><Text label="Plan name" value={plan.name} onChange={(v) => setPlanField("name", v)} /><NumberInput label="Monthly credits" value={plan.monthly_credits} onChange={(v) => setPlanField("monthly_credits", v)} /><NumberInput label="Dedicated numbers" value={plan.dedicated_numbers} onChange={(v) => setPlanField("dedicated_numbers", v)} /><Text label="Reference price (USD)" value={plan.reference_price_usd} onChange={(v) => setPlanField("reference_price_usd", v)} /></Grid>
        <label className="mt-4 block text-sm font-semibold">Description<textarea value={plan.description} onChange={(e) => setPlanField("description", e.target.value)} rows={3} className="mt-2 w-full rounded-xl border p-3 font-normal" /></label>
        <label className="mt-4 block text-sm font-semibold">Features, one per line<textarea value={plan.features.join("\n")} onChange={(e) => setPlanField("features", e.target.value.split("\n").filter(Boolean))} rows={5} className="mt-2 w-full rounded-xl border p-3 font-normal" /></label>
        <div className="mt-4 grid gap-3 md:grid-cols-3"><Toggle label="Setup fee enabled" checked={plan.setup_fee_enabled} onChange={(v) => setPlanField("setup_fee_enabled", v)} /><Toggle label="Free setup badge" checked={plan.free_setup_badge_enabled} onChange={(v) => setPlanField("free_setup_badge_enabled", v)} /><Toggle label="Plan active" checked={plan.is_active} onChange={(v) => setPlanField("is_active", v)} /></div>
      </Card>}
      <Card title="Credit costs"><Grid><NumberInput label="Outbound SMS / segment" value={settings.sms_outbound_per_segment} onChange={(v) => set("sms_outbound_per_segment", v)} /><NumberInput label="Inbound SMS / message" value={settings.sms_inbound_per_message} onChange={(v) => set("sms_inbound_per_message", v)} /><NumberInput label="Outbound MMS" value={settings.mms_outbound} onChange={(v) => set("mms_outbound", v)} /><NumberInput label="Inbound MMS" value={settings.mms_inbound} onChange={(v) => set("mms_inbound", v)} /><NumberInput label="WhatsApp inbound conversation" value={settings.whatsapp_inbound_conversation} onChange={(v) => set("whatsapp_inbound_conversation", v)} /><NumberInput label="WhatsApp outbound conversation" value={settings.whatsapp_outbound_conversation} onChange={(v) => set("whatsapp_outbound_conversation", v)} /><NumberInput label="WhatsApp window hours" value={settings.whatsapp_window_hours} onChange={(v) => set("whatsapp_window_hours", v)} /><NumberInput label="Email outbound" value={settings.email_outbound} onChange={(v) => set("email_outbound", v)} /><NumberInput label="Email inbound" value={settings.email_inbound} onChange={(v) => set("email_inbound", v)} /></Grid></Card>
      <Card title="Allowance, alerts, and starter credits"><Grid><NumberInput label="Rollover months" value={settings.rollover_months} onChange={(v) => set("rollover_months", v)} /><NumberInput label="Renewal grace hours" value={settings.renewal_grace_hours} onChange={(v) => set("renewal_grace_hours", v)} /><NumberInput label="Low-balance warning %" value={settings.low_balance_threshold_percent} onChange={(v) => set("low_balance_threshold_percent", v)} /><NumberInput label="Starter credits" value={settings.trial_credits} onChange={(v) => set("trial_credits", v)} /><NumberInput label="Demo daily cap" value={settings.demo_daily_message_cap} onChange={(v) => set("demo_daily_message_cap", v)} /><NumberInput label="Paused follow-up max age" value={settings.paused_followup_max_age_days} onChange={(v) => set("paused_followup_max_age_days", v)} /></Grid><div className="mt-4 grid gap-3 md:grid-cols-3"><Toggle label="Rollover enabled" checked={settings.rollover_enabled} onChange={(v) => set("rollover_enabled", v)} /><Toggle label="Starter credits enabled" checked={settings.trial_enabled} onChange={(v) => set("trial_enabled", v)} /><Toggle label="Demo enabled" checked={settings.demo_enabled} onChange={(v) => set("demo_enabled", v)} /><Toggle label="Low balance email" checked={settings.low_balance_email_enabled} onChange={(v) => set("low_balance_email_enabled", v)} /><Toggle label="Exhausted email" checked={settings.exhausted_email_enabled} onChange={(v) => set("exhausted_email_enabled", v)} /><Toggle label="Top-ups require Pro" checked={settings.topups_require_active_subscription} onChange={(v) => set("topups_require_active_subscription", v)} /></div></Card>
      <Card title="Operation and display"><Grid><label className="text-sm font-semibold">Enforcement mode<select value={settings.enforcement_mode} onChange={(e) => set("enforcement_mode", e.target.value as CreditSettings["enforcement_mode"])} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal"><option value="shadow">Shadow — calculate only</option><option value="enforce">Enforce — block at zero</option></select></label><NumberInput label="Number retention days" value={settings.number_retention_days_after_lapse} onChange={(v) => set("number_retention_days_after_lapse", v)} /><Text label="Number setup ETA" value={settings.number_setup_eta_text} onChange={(v) => set("number_setup_eta_text", v)} /><Text label="Terms URL" value={settings.terms_url} onChange={(v) => set("terms_url", v)} /><Text label="Privacy URL" value={settings.privacy_url} onChange={(v) => set("privacy_url", v)} /><Text label="Account deletion URL" value={settings.account_deletion_url} onChange={(v) => set("account_deletion_url", v)} /></Grid></Card>
      {message && <p className="text-sm text-blue-600">{message}</p>}
      <button disabled={saving} className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : "Save Billing & Credits"}</button>
    </form>
    <Card title="Store products and top-up packs"><p className="mb-4 text-sm text-slate-500">Credits, badges, visibility, and ordering are managed here. Actual prices remain in App Store Connect and Google Play Console.</p><div className="space-y-4">{products.map((product) => <div key={product.id} className="rounded-xl border p-4"><div className="mb-3 flex items-center justify-between"><div><strong>{product.code}</strong><p className="text-xs uppercase text-slate-500">{product.kind}</p></div><Toggle label="Active" checked={product.is_active} onChange={(v) => setProducts((items) => items.map((item) => item.id === product.id ? { ...item, is_active: v } : item))} /></div><Grid><Text label="Apple product ID" value={product.apple_product_id} onChange={(v) => setProducts((items) => items.map((item) => item.id === product.id ? { ...item, apple_product_id: v } : item))} /><Text label="Google product ID" value={product.google_product_id} onChange={(v) => setProducts((items) => items.map((item) => item.id === product.id ? { ...item, google_product_id: v } : item))} /><NumberInput label="Credits granted" value={product.credits} onChange={(v) => setProducts((items) => items.map((item) => item.id === product.id ? { ...item, credits: v } : item))} /><Text label="Reference price USD" value={product.reference_price_usd} onChange={(v) => setProducts((items) => items.map((item) => item.id === product.id ? { ...item, reference_price_usd: v } : item))} /><Text label="Badge" value={product.badge_text} onChange={(v) => setProducts((items) => items.map((item) => item.id === product.id ? { ...item, badge_text: v } : item))} /><NumberInput label="Sort order" value={product.sort_order} onChange={(v) => setProducts((items) => items.map((item) => item.id === product.id ? { ...item, sort_order: v } : item))} /></Grid><button type="button" onClick={() => saveProduct(product)} className="mt-4 rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600">Save product</button></div>)}</div></Card>
  </div>;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-2xl border bg-white p-6 sm:p-8"><h2 className="mb-5 text-xl font-bold">{title}</h2>{children}</section>; }
function Grid({ children }: { children: React.ReactNode }) { return <div className="grid gap-5 md:grid-cols-2">{children}</div>; }
function Text({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="text-sm font-semibold">{label}<input value={value || ""} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label>; }
function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <label className="text-sm font-semibold">{label}<input type="number" min={0} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium"><span>{label}</span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5" /></label>; }

