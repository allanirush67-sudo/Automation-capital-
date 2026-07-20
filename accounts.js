// Lists the accounts belonging to the logged-in user.
// Runs server-side to avoid any browser CORS restrictions on Deriv's REST API.

const CLIENT_ID = "33LmybMDVZwbkwEkOGHqz";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { access_token } = req.body;
  if (!access_token) return res.status(400).json({ error: "Missing access_token" });

  try {
    const derivRes = await fetch("https://api.derivws.com/trading/v1/options/accounts", {
      method: "GET",
      headers: {
        "Deriv-App-ID": CLIENT_ID,
        "Authorization": `Bearer ${access_token}`
      }
    });
    const data = await derivRes.json();
    if (!derivRes.ok) {
      return res.status(derivRes.status).json({ error: "Failed to fetch accounts", details: data });
    }
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Server error fetching accounts", details: err.message });
  }
}
