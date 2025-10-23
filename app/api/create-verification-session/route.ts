import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(request: NextRequest) {
  try {
    console.log("Creating verification session...");

    // Check if Stripe secret key is available
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY is not set");
      return NextResponse.json(
        { error: "Stripe secret key not configured" },
        { status: 500 }
      );
    }

    // Get user data from request body
    const body = await request.json();
    const { email, userId, type, phone } = body as {
      email?: string;
      userId?: string;
      type?: "document" | "id_number";
      phone: string;
    };

// log this url
console.log("return_url", `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/register/kyc?verification=complete`)
      console.log("NEXT_PUBLIC_BASE_URL", process.env.NEXT_PUBLIC_BASE_URL)
    const verificationSession =
      await stripe.identity.verificationSessions.create({
        type,
        provided_details: {
          email: email || "user@example.com",
          phone: phone,
        },
        metadata: {
          user_id: userId || "user_123",
        },
      }). then ( s => {
        console.log("verificationSession.url", s.url)
        return s;
      });

      // log the url
      console.log("verificationSession.url", verificationSession.url)
      console.log(verificationSession, "verificationSession")

    console.log("Verification session created:", verificationSession.id);

    // Return the verification URL instead of client secret
    return NextResponse.json({
      clientSecret: verificationSession.client_secret,
      verificationUrl: verificationSession.url,
      sessionId: verificationSession.id,
    });
  } catch (error) {
    console.error("Error creating verification session:", error);

    // Return more detailed error information
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
