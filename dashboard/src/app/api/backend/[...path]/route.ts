import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { getBackendApiBaseUrl, readJsonSafely } from "@/lib/backend";

const ACCESS_COOKIE = "chesera_admin_access";
const REFRESH_COOKIE = "chesera_admin_refresh";
const PUBLIC_PATHS = new Set([
  "admin/auth/password-reset/request",
  "admin/auth/password-reset/verify",
  "admin/auth/password-reset/confirm",
]);

type RouteContext = { params: Promise<{ path: string[] }> };

async function refreshAccessToken(refresh: string) {
  const response = await fetch(`${getBackendApiBaseUrl()}/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
    cache: "no-store",
  });
  const payload = await readJsonSafely(response);
  const data = payload.data as Record<string, unknown> | undefined;
  return {
    ok: response.ok,
    access: typeof data?.access === "string" ? data.access : "",
    refresh: typeof data?.refresh === "string" ? data.refresh : refresh,
  };
}

async function proxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  if (!path?.length || path.some((part) => part === ".." || part.includes("/"))) {
    return NextResponse.json({ detail: "Invalid backend path." }, { status: 400 });
  }

  const cookieStore = await cookies();
  let access = cookieStore.get(ACCESS_COOKIE)?.value || "";
  const refresh = cookieStore.get(REFRESH_COOKIE)?.value || "";
  const requestedPath = path.join("/");
  const isPublicPath = PUBLIC_PATHS.has(requestedPath);
  if (!access && !isPublicPath) {
    return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
  }

  const target = new URL(`${getBackendApiBaseUrl()}/${path.join("/")}/`);
  request.nextUrl.searchParams.forEach((value, key) => target.searchParams.append(key, value));

  const headers = new Headers();
  if (access) headers.set("Authorization", `Bearer ${access}`);
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer();
  const perform = () => fetch(target, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
    redirect: "manual",
  });

  let backendResponse = await perform();
  let rotatedRefresh = refresh;
  if (backendResponse.status === 401 && refresh) {
    const refreshed = await refreshAccessToken(refresh);
    if (refreshed.ok && refreshed.access) {
      access = refreshed.access;
      rotatedRefresh = refreshed.refresh;
      headers.set("Authorization", `Bearer ${access}`);
      backendResponse = await perform();
    }
  }

  const responseHeaders = new Headers();
  for (const name of ["content-type", "content-disposition", "content-length"]) {
    const value = backendResponse.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  const response = new NextResponse(await backendResponse.arrayBuffer(), {
    status: backendResponse.status,
    headers: responseHeaders,
  });

  if (backendResponse.status === 401) {
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
  } else if (access !== cookieStore.get(ACCESS_COOKIE)?.value) {
    const secure = process.env.NODE_ENV === "production";
    response.cookies.set(ACCESS_COOKIE, access, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 60 });
    response.cookies.set(REFRESH_COOKIE, rotatedRefresh, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 60 });
  }
  return response;
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
