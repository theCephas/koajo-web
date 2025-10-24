export async function fetchVerificationSession(options: {
  email: string;
  userId: string;
  type: string;
  phone: string;
}) {
  const { email, userId, type, phone } = options;
  try {
    const response = await fetch("/api/create-verification-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        email,
        userId,
        type,
        phone,
      }),
    });


  if (!response.ok) throw new Error("Failed to create verification session");

    const { clientSecret, verificationUrl, sessionId } = await response.json();
    return { clientSecret, verificationUrl, sessionId };
  } catch (error) {
    console.error("Error fetching verification session:", error);
  }
}
