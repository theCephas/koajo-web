import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(request: NextRequest) {
  try {
    console.log("Creating verification session...");

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe secret key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { email, userId, type, phone } = body as {
      email?: string;
      userId?: string;
      type?: "document" | "id_number";
      phone: string;
    };

    const verificationSession = await stripe.identity.verificationSessions.create({
      type,
      provided_details: {
        email: email || "user@example.com",
        phone: phone,
      },
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/register/kyc?${type}=submitted`,
      metadata: {
        user_id: userId || "user_123",
      },
    });

    console.log("Verification session created:", {
      id: verificationSession.id,
      status: verificationSession.status,
      client_secret: verificationSession.client_secret?.substring(0, 20) + "...",
      url: verificationSession.url
    });


    return NextResponse.json({
      clientSecret: verificationSession.client_secret,
      verificationUrl: verificationSession.url,
      sessionId: verificationSession.id,
    }, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error) {
    console.error("Error creating verification session:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    // const errorCode = (error as Error)?.code || 'unknown';

    return NextResponse.json(
      {
        error: "Failed to create verification session",
        details: errorMessage,
        // code: errorCode
      },
      { status: 500 }
    );
  }
}
