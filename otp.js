// Gets a ready-to-use WebSocket URL (with OTP embedded) for a specific account.
// Runs server-side to avoid any browser CORS restrictions on Deriv's REST API.

const CLIENT_ID = "33LmybMDVZwbkwEkOGHqz";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { access_token, account_id } = req.body;
  if (!access_token || !account_id) {
    return res.status(400).json({ error: "Missing access_token or account_id" });
  }

  try {
    const derivRes = await fetch(`https://api.derivws.com/trading/v1/options/accounts/${account_id}/otp`, {
      method: "POST",
      headers: {
        "Deriv-App-ID": CLIENT_ID,
        "Authorization": `Bearer ${access_token}`
      }
    });
    const data = await derivRes.json();
    if (!derivRes.ok) {
      return res.status(derivRes.status).json({ error: "Failed to get OTP session", details: data });
    }
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Server error fetching OTP session", details: err.message });
  }
}
