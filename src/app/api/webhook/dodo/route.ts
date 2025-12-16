import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

export async function POST(request: NextRequest) {
  try {
    // Read raw body
    const rawBody = await request.text();
    
    // Get webhook secret
    const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("DODO_WEBHOOK_SECRET is not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 },
      );
    }

    // Get signature from headers (try common header names)
    const signature =
      request.headers.get("signature") ||
      request.headers.get("x-signature") ||
      request.headers.get("dodo-signature") ||
      request.headers.get("x-dodo-signature");

    if (!signature) {
      console.error("Missing Dodo signature header");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 },
      );
    }

    // Verify signature using HMAC-SHA256
    const expectedSignature = createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    // Compare signatures using constant-time comparison
    try {
      const signatureBuffer = Buffer.from(signature, "hex");
      const expectedBuffer = Buffer.from(expectedSignature, "hex");

      if (
        signatureBuffer.length !== expectedBuffer.length ||
        !timingSafeEqual(signatureBuffer, expectedBuffer)
      ) {
        console.error("Invalid Dodo webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 400 },
        );
      }
    } catch (bufferError) {
      // If signature is not valid hex, try direct string comparison
      if (signature !== expectedSignature) {
        console.error("Invalid Dodo webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 400 },
        );
      }
    }

    // Parse JSON body
    let event;
    try {
      event = JSON.parse(rawBody);
    } catch (parseError) {
      console.error("Failed to parse webhook body as JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    // Log event type
    const eventType = event.type || event.event || event.event_type;
    console.log("Dodo webhook received - Event type:", eventType);

    // Only process payment.succeeded events
    if (eventType === "payment.succeeded") {
      console.log("Processing payment.succeeded event");
      // TODO: Add business logic here later
    } else {
      console.log(`Ignoring event type: ${eventType}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing Dodo webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

