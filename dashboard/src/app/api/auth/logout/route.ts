import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("chesera_admin_access");
  response.cookies.delete("chesera_admin_refresh");
  return response;
}
