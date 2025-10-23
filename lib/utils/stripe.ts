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
      body: JSON.stringify({
        email,
        userId,
        type,
        phone,
      }),
    });

    const { clientSecret, verificationUrl, sessionId } = await response.json();
    return { clientSecret, verificationUrl, sessionId };
  } catch (error) {
    console.error("Error fetching verification session:", error);
  }
}
