import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getBackendApiBaseUrl, readJsonSafely } from "@/lib/backend";

export async function GET() {
  const cookieStore = await cookies();
  const access = cookieStore.get("chesera_admin_access")?.value;
  if (!access) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const backendResponse = await fetch(`${getBackendApiBaseUrl()}/admin/profile/`, {
      headers: { Authorization: `Bearer ${access}` },
      cache: "no-store",
    });
    const payload = await readJsonSafely(backendResponse);
    if (!backendResponse.ok) {
      const response = NextResponse.json({ authenticated: false }, { status: 401 });
      response.cookies.delete("chesera_admin_access");
      response.cookies.delete("chesera_admin_refresh");
      return response;
    }
    return NextResponse.json({ authenticated: true, user: payload.data });
  } catch {
    return NextResponse.json({ message: "The authentication service is temporarily unavailable." }, { status: 503 });
  }
}
