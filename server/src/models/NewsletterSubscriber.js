const mongoose = require("mongoose");

const NewsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
      unique: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["subscribed", "unsubscribed"],
      default: "subscribed",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  "NewsletterSubscriber",
  NewsletterSubscriberSchema,
);
