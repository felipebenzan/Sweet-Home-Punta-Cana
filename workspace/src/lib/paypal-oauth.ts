
type Env = "sandbox" | "live";

function getEnv() {
  const env = (process.env.PAYPAL_ENV as Env) || "sandbox";
  const base = env === "live" ? "https://api.paypal.com" : "https://api.sandbox.paypal.com";
  const client = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  if (!client || !secret || client.includes('YOUR_')) {
    console.error("FATAL: Missing or placeholder PAYPAL_CLIENT_ID or PAYPAL_SECRET in environment variables. Please update the .env file with your credentials from the PayPal Developer Dashboard.");
    throw new Error("Missing or placeholder PayPal credentials. Please update the .env file.");
  }
  return { env, base, client, secret };
}

export async function getAccessToken() {
  const { base, client, secret } = getEnv();
  const auth = Buffer.from(`${client}:${secret}`).toString("base64");
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const text = await res.text();
  if (!res.ok) {
    console.error("TOKEN FETCH FAILED", { status: res.status, text });
    throw new Error(`TOKEN ${res.status} ${text}`);
  }
  const j = JSON.parse(text);
  return { token: j.access_token as string, base };
}
