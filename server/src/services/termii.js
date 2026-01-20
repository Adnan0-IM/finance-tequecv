const axios = require("axios");

const TERMII_BASE_URL = (process.env.TERMII_BASE_URL || "https://api.termii.com").replace(/\/+$/, "");
const TERMII_API_KEY = process.env.TERMII_API_KEY;
const TERMII_EMAIL_CONFIGURATION_ID = process.env.TERMII_EMAIL_CONFIGURATION_ID;

function assertEnv() {
  if (!TERMII_API_KEY) throw new Error("TERMII_API_KEY not set");
  if (!TERMII_EMAIL_CONFIGURATION_ID)
    throw new Error("TERMII_EMAIL_CONFIGURATION_ID not set");
}

async function sendEmailOtp({ email, code }) {
  assertEnv();

  const url = `${TERMII_BASE_URL}/api/email/otp/send`;
  const payload = {
    api_key: TERMII_API_KEY,
    email_address: email,
    code: String(code),
    email_configuration_id: TERMII_EMAIL_CONFIGURATION_ID,
  };

  const { data } = await axios.post(url, payload, {
    headers: { "Content-Type": "application/json" },
    timeout: Number(process.env.TERMII_TIMEOUT_MS || 15_000),
  });

  return data; // { code: "ok", message: "...", message_id: "...", ... }
}

module.exports = { sendEmailOtp };