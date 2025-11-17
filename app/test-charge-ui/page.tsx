"use client";

import { useState } from "react";

/**
 * TEMPORARY TEST PAGE
 * Navigate to /test-charge-ui to test charging
 * DELETE THIS FILE after testing
 */
export default function TestChargePage() {
  const [customerId, setCustomerId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [amount, setAmount] = useState("5000");
  const [podId, setPodId] = useState("test_pod_123");
  const [membershipId, setMembershipId] = useState("test_membership_456");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/test-charge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId,
          paymentMethodId,
          amount: parseInt(amount),
          podId,
          membershipId,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Test ACH Charge</h1>

        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            ⚠️ This is a test page. Delete this file after testing.
            <br />
            Find the Stripe IDs in your database or Stripe Dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Stripe Customer ID
            </label>
            <input
              type="text"
              placeholder="cus_xxxxxxxxxxxxx"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Method ID
            </label>
            <input
              type="text"
              placeholder="pm_xxxxxxxxxxxxx"
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Amount (in cents)
            </label>
            <input
              type="number"
              placeholder="5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              {parseInt(amount) / 100} USD
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Pod ID (optional)
            </label>
            <input
              type="text"
              value={podId}
              onChange={(e) => setPodId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Membership ID (optional)
            </label>
            <input
              type="text"
              value={membershipId}
              onChange={(e) => setMembershipId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Charging..." : "Test Charge"}
          </button>
        </form>

        {result && (
          <div className="mt-6">
            <h2 className="font-semibold mb-2">Result:</h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>

            {result.success && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 font-medium">
                  ✅ Payment Intent Created Successfully!
                </p>
                <p className="text-sm text-green-700 mt-2">
                  Intent ID: {result.intentId}
                  <br />
                  Status: {result.status}
                </p>
                <p className="text-xs text-green-600 mt-2">
                  Now check your Stripe Dashboard for webhook events:
                  <br />
                  - payment_intent.processing (immediate)
                  <br />
                  - payment_intent.succeeded (1-5 business days)
                </p>
              </div>
            )}

            {!result.success && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800 font-medium">
                  ❌ Charge Failed
                </p>
                <p className="text-sm text-red-700 mt-2">
                  {result.error}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
