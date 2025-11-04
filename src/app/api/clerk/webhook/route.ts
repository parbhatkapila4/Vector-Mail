import { NextRequest } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { Webhook } from "svix";

export async function POST(request: NextRequest) {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const headerPayload = request.headers;
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("Missing required svix headers");
      return new Response("Missing required headers", { status: 400 });
    }

    const payload = await request.text();
    const body = JSON.parse(payload);

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;

    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Webhook verification failed", { status: 400 });
    }

    const { data, type } = evt as { data: any; type: string };

    if (!data || !data.id) {
      console.error("Invalid webhook data: missing data or id");
      return new Response("Invalid data", { status: 400 });
    }

    if (type === "user.created") {
      console.log("Processing user.created webhook for user:", data.id);

      const emailAddress = data.email_addresses?.[0]?.email_address;

      if (!emailAddress) {
        console.error("No email address found for user:", data.id);
        return new Response("No email address", { status: 400 });
      }

      const firstName = data.first_name || null;
      const lastName = data.last_name || null;
      const imageUrl = data.image_url || null;
      const id = data.id;

      console.log("User data:", { emailAddress, firstName, lastName, id });

      try {
        await db.user.upsert({
          where: { emailAddress },
          update: {
            firstName,
            lastName,
            imageUrl,
            id,
          },
          create: {
            emailAddress,
            firstName,
            lastName,
            imageUrl,
            id,
          },
        });
        console.log("User upserted successfully:", id);
      } catch (dbError) {
        console.error("Database error upserting user:", dbError);
        return new Response("Database error", { status: 500 });
      }
    }

    return new Response("OK");
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
