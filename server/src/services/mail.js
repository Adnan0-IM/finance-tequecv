const dotenv = require("dotenv");
dotenv.config();
const { sendEmailOtp, sendTemplateEmail } = require("./termii");

const APP_URL = process.env.APP_URL || "http://localhost:5173";
const EMAIL_DISABLED = process.env.EMAIL_DISABLED === "1";

// Optional branding/env (used by templates)
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@financetequecv.com";
const ASSET_BASE_URL = process.env.ASSET_BASE_URL || APP_URL;
const LOGO_URL = process.env.LOGO_URL || `${ASSET_BASE_URL}/logo.png`;

// Termii template IDs (set these in your .env)
const TERMII_TEMPLATE_RESET_PASSWORD =
  process.env.TERMII_TEMPLATE_RESET_PASSWORD;
const TERMII_TEMPLATE_VERIFICATION_SUBMITTED =
  process.env.TERMII_TEMPLATE_VERIFICATION_SUBMITTED;
const TERMII_TEMPLATE_ADMIN_NOTIFICATION =
  process.env.TERMII_TEMPLATE_ADMIN_NOTIFICATION;
const TERMII_TEMPLATE_WELCOME = process.env.TERMII_TEMPLATE_WELCOME;

function isDisabled() {
  if (EMAIL_DISABLED) {
    console.warn("Email sending disabled (EMAIL_DISABLED=1) - skipping.");
    return true;
  }
  return false;
}

function ensureTemplate(id, envName) {
  if (!id) {
    console.warn(`${envName} not set - skipping email send.`);
    return false;
  }
  return true;
}

// Common variables available in *all* Termii templates
function commonVars(extra = {}) {
  return {
    app_url: APP_URL,
    asset_base_url: ASSET_BASE_URL,
    logo_url: LOGO_URL,
    support_email: SUPPORT_EMAIL,
    year: String(new Date().getFullYear()),
    ...extra,
  };
}

async function sendVerificationEmail(to, code) {
  if (isDisabled()) return;

  const resp = await sendEmailOtp({ email: to, code });
  if (resp?.code !== "ok") {
    throw new Error(`Termii email OTP failed: ${JSON.stringify(resp)}`);
  }
}

async function sendResetPasswordEmail(to, token) {
  if (isDisabled()) return;
  if (
    !ensureTemplate(
      TERMII_TEMPLATE_RESET_PASSWORD,
      "TERMII_TEMPLATE_RESET_PASSWORD",
    )
  )
    return;

  const name = to.split("@")[0];
  const resetUrl = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`;

  const resp = await sendTemplateEmail({
    email: to,
    subject: "Password reset request",
    templateId: TERMII_TEMPLATE_RESET_PASSWORD,
    variables: commonVars({
      name,
      reset_url: resetUrl,
      // include if your template uses it:
      expires_in: process.env.RESET_PASSWORD_EXPIRES_IN || "30 minutes",
    }),
  });

  if (resp?.code !== "ok") {
    throw new Error(`Termii template email failed: ${JSON.stringify(resp)}`);
  }
}

async function sendWelcomeEmail(to, name = to.split("@")[0]) {
  if (isDisabled()) return;
  if (!ensureTemplate(TERMII_TEMPLATE_WELCOME, "TERMII_TEMPLATE_WELCOME"))
    return;

  const dashboardUrl = `${APP_URL}/dashboard`;

  const resp = await sendTemplateEmail({
    email: to,
    subject: "Welcome to Finance Teque",
    templateId: TERMII_TEMPLATE_WELCOME,
    variables: commonVars({
      name,
      dashboard_url: dashboardUrl,
    }),
  });

  if (resp?.code !== "ok") {
    throw new Error(`Termii template email failed: ${JSON.stringify(resp)}`);
  }
}

async function sendVerificationSubmittedEmail(to, name = to.split("@")[0]) {
  if (isDisabled()) return;
  if (
    !ensureTemplate(
      TERMII_TEMPLATE_VERIFICATION_SUBMITTED,
      "TERMII_TEMPLATE_VERIFICATION_SUBMITTED",
    )
  )
    return;

  const dashboardUrl = `${APP_URL}/dashboard`;

  const resp = await sendTemplateEmail({
    email: to,
    subject: "We received your verification details",
    templateId: TERMII_TEMPLATE_VERIFICATION_SUBMITTED,
    variables: commonVars({
      name,
      dashboard_url: dashboardUrl,
    }),
  });

  if (resp?.code !== "ok") {
    throw new Error(`Termii template email failed: ${JSON.stringify(resp)}`);
  }
}

async function sendAdminVerificationNotification(
  to,
  { email, name = email.split("@")[0] },
) {
  if (isDisabled()) return;
  if (
    !ensureTemplate(
      TERMII_TEMPLATE_ADMIN_NOTIFICATION,
      "TERMII_TEMPLATE_ADMIN_NOTIFICATION",
    )
  )
    return;

  const adminUrl = `${APP_URL}/admin`;

  const resp = await sendTemplateEmail({
    email: to,
    subject: "New verification submission",
    templateId: TERMII_TEMPLATE_ADMIN_NOTIFICATION,
    variables: commonVars({
      user_name: name,
      user_email: email,
      admin_url: adminUrl,
    }),
  });

  if (resp?.code !== "ok") {
    throw new Error(`Termii template email failed: ${JSON.stringify(resp)}`);
  }
}

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendWelcomeEmail,
  sendVerificationSubmittedEmail,
  sendAdminVerificationNotification,
};
