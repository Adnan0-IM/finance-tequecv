const express = require("express");
const NewsletterSubscriber = require("../models/NewsletterSubscriber");

const router = express.Router();

const isValidEmail = (email) =>
  typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

router.post("/subscribe", async (req, res) => {
  const { email } = req.body || {};

  if (!isValidEmail(email)) {
    return res
      .status(400)
      .json({ success: false, error: "Valid email is required" });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await NewsletterSubscriber.findOne({
      email: normalizedEmail,
    });
    if (existing) {
      if (existing.status !== "subscribed") {
        existing.status = "subscribed";
        existing.subscribedAt = new Date();
        await existing.save();
      }
      return res.status(200).json({
        success: true,
        message: "Already subscribed.",
      });
    }

    await NewsletterSubscriber.create({
      email: normalizedEmail,
      subscribedAt: new Date(),
      status: "subscribed",
    });

    return res.status(200).json({
      success: true,
      message: "Subscribed successfully.",
    });
  } catch (err) {
    console.error("[newsletter] subscribe error:", err?.message || err);
    return res.status(500).json({
      success: false,
      error: "Could not subscribe",
    });
  }
});

router.post("/unsubscribe", async (req, res) => {
  const { email } = req.body || {};

  if (!isValidEmail(email)) {
    return res
      .status(400)
      .json({ success: false, error: "Valid email is required" });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await NewsletterSubscriber.findOne({
      email: normalizedEmail,
    });

    if (!existing) {
      return res.status(200).json({
        success: true,
        message: "Not subscribed.",
      });
    }

    if (existing.status !== "unsubscribed") {
      existing.status = "unsubscribed";
      await existing.save();
    }

    return res.status(200).json({
      success: true,
      message: "Unsubscribed successfully.",
    });
  } catch (err) {
    console.error("[newsletter] unsubscribe error:", err?.message || err);
    return res.status(500).json({
      success: false,
      error: "Could not unsubscribe",
    });
  }
});

module.exports = router;
