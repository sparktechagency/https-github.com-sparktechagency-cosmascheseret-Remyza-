export function getBackendApiBaseUrl(): string {
  return (process.env.API_BASE_URL || "https://api.trychesera.com/api/v1").replace(/\/$/, "");
}

export async function readJsonSafely(response: Response): Promise<Record<string, unknown>> {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}
