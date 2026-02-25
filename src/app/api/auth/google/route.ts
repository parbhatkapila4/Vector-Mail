import { buildAurinkoGoogleAuthUrl } from "@/lib/aurinko";
import { NextResponse } from "next/server";

export async function GET() {
  const url = await buildAurinkoGoogleAuthUrl();
  return NextResponse.redirect(url);
}
