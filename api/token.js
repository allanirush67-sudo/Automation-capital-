// This runs on the server (Vercel), never in the visitor's browser.
// It takes the temporary login code + code_verifier from the frontend,
// and exchanges them with Deriv for a real access_token.
// This step CANNOT be done from a webpage directly -- Deriv requires it
// to happen server-side, which is exactly what this file does.

export default async function handler(req, res) {
  // Allow requests from your site only (basic CORS handling)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code, code_verifier, redirect_uri, client_id } = req.body;

  if (!code || !code_verifier || !redirect_uri || !client_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("client_id", client_id);
    params.append("code", code);
    params.append("code_verifier", code_verifier);
    params.append("redirect_uri", redirect_uri);

    const derivRes = await fetch("https://auth.deriv.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });

    const data = await derivRes.json();

    if (!derivRes.ok) {
      return res.status(derivRes.status).json({ error: data.error || "Token exchange failed", details: data });
    }

    // data should contain: access_token, expires_in, token_type
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Server error during token exchange", details: err.message });
  }
    }
