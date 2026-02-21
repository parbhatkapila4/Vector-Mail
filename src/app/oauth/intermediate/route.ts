import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.toString();
  const target = query
    ? `https://api.aurinko.io/v1/auth/callback?${query}`
    : `https://api.aurinko.io/v1/auth/callback`;

  return NextResponse.redirect(target);
}
