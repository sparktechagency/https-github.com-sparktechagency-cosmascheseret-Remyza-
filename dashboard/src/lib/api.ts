export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(message: string, status: number, payload: unknown) { super(message); this.status = status; this.payload = payload; }
}

function extractMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "Request failed.";
  const record = payload as Record<string, unknown>;
  if (typeof record.detail === "string") return record.detail;
  if (typeof record.message === "string") return record.message;
  const first = Object.values(record)[0];
  if (Array.isArray(first) && typeof first[0] === "string") return first[0];
  if (first && typeof first === "object") {
    const nested = Object.values(first as Record<string, unknown>)[0];
    if (Array.isArray(nested) && typeof nested[0] === "string") return nested[0];
  }
  return "Request failed.";
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const normalized = path.replace(/^\/+/, "");
  const response = await fetch(`/api/backend/${normalized}`, { ...init, headers: init?.body instanceof FormData ? init.headers : { "Content-Type": "application/json", ...init?.headers }, cache: "no-store" });
  const contentType = response.headers.get("content-type") || "";
  const payload = response.status === 204 ? null : contentType.includes("application/json") ? await response.json().catch(() => null) : await response.text().catch(() => null);
  if (!response.ok) throw new ApiError(extractMessage(payload), response.status, payload);
  return payload as T;
}

export function formatDate(value?: string | null): string { if (!value) return "—"; const date = new Date(value); if (Number.isNaN(date.getTime())) return "—"; return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(date); }
export function formatNumber(value?: number | string | null): string { return new Intl.NumberFormat("en-US").format(Number(value || 0)); }
export function formatCurrency(value?: number | string | null, currency = "USD"): string { return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(value || 0)); }
