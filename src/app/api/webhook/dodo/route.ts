import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  console.log("Dodo webhook received");
  console.log("Dodo webhook raw body:", rawBody);

  return NextResponse.json({ received: true }, { status: 200 });
}

