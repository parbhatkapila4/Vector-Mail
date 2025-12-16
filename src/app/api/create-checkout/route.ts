import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const PRICING = {
  pro: 999, // USD cents
  enterprise: 6000, // USD cents
} as const;

type Plan = keyof typeof PRICING;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, userId } = body;

    // Validate plan
    if (!plan || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: plan, userId" },
        { status: 400 },
      );
    }

    if (plan !== "pro" && plan !== "enterprise") {
      return NextResponse.json(
        { error: "Invalid plan. Must be 'pro' or 'enterprise'" },
        { status: 400 },
      );
    }

    // Get amount from pricing map
    const amount = PRICING[plan as Plan];

    // Get Dodo secret key
    const dodoSecretKey = process.env.DODO_SECRET_KEY;
    if (!dodoSecretKey) {
      console.error("DODO_SECRET_KEY is not configured");
      return NextResponse.json(
        { error: "Payment service not configured" },
        { status: 500 },
      );
    }

    // Create checkout session with Dodo Payments API
    const checkoutPayload = {
      amount,
      currency: "USD",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
      metadata: {
        userId,
        plan,
      },
    };

    const response = await axios.post(
      "https://api.dodopay.com/v1/checkout",
      checkoutPayload,
      {
        headers: {
          Authorization: `Bearer ${dodoSecretKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `${userId}-${plan}`,
        },
      },
    );

    const checkoutUrl =
      response.data.checkout_url ||
      response.data.checkoutUrl ||
      response.data.url;

    if (!checkoutUrl) {
      console.error("Dodo API response missing checkoutUrl:", response.data);
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 },
      );
    }

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error("Error creating checkout:", error);
    
    if (axios.isAxiosError(error)) {
      console.error("Dodo API error:", error.response?.data);
      return NextResponse.json(
        { error: "Payment service error" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

