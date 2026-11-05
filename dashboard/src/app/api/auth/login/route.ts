import { NextResponse } from "next/server";

import { getBackendApiBaseUrl, readJsonSafely } from "@/lib/backend";

const ACCESS_COOKIE = "chesera_admin_access";
const REFRESH_COOKIE = "chesera_admin_refresh";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${getBackendApiBaseUrl()}/admin/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "The authentication service is temporarily unavailable." },
      { status: 503 },
    );
  }

  const payload = await readJsonSafely(backendResponse);
  if (!backendResponse.ok) {
    return NextResponse.json(
      { message: backendResponse.status === 429 ? "Too many login attempts. Please try again later." : "Invalid email or password." },
      { status: backendResponse.status },
    );
  }

  const data = payload.data as Record<string, unknown> | undefined;
  const access = typeof data?.access === "string" ? data.access : "";
  const refresh = typeof data?.refresh === "string" ? data.refresh : "";
  if (!access || !refresh) {
    return NextResponse.json({ message: "The authentication response was incomplete." }, { status: 502 });
  }

  const response = NextResponse.json({ success: true, user: data?.user });
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set(ACCESS_COOKIE, access, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  });
  response.cookies.set(REFRESH_COOKIE, refresh, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  });
  return response;
}
