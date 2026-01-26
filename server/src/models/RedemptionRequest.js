const mongoose = require("mongoose");

const RedemptionRequestSchema = new mongoose.Schema(
  {
    investmentId: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },

    fundType: {
      type: String,
      required: true,
      enum: ["ethical", "equity", "debt"],
    },

    amountFigures: { type: String, required: true, trim: true },
    amountWords: { type: String, required: true, trim: true },

    redemptionType: {
      type: String,
      required: true,
      enum: ["partial", "full"],
    },

    fullName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    lga: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },

    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },

    bankName: { type: String, trim: true },
    accountName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    accountType: { type: String, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("RedemptionRequest", RedemptionRequestSchema);
