const RedemptionRequest = require("../models/RedemptionRequest");

const requiredFields = [
  "investmentId",
  "date",
  "fundType",
  "amountFigures",
  "amountWords",
  "redemptionType",
  "fullName",
  "address",
  "city",
  "lga",
  "state",
  "phone",
  "email",
];

exports.createRedemptionRequest = async (req, res) => {
  try {
    const payload = req.body || {};

    if (payload.confirmAuthorized !== true) {
      return res.status(400).json({
        success: false,
        message: "You must confirm this request is authorized",
      });
    }

    const missing = requiredFields.filter((k) => {
      const v = payload[k];
      return typeof v !== "string" || v.trim().length === 0;
    });

    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    // Basic bank consistency checks (mirrors client side behavior)
    const bankName = String(payload.bankName ?? "").trim();
    const accountName = String(payload.accountName ?? "").trim();
    const accountNumber = String(payload.accountNumber ?? "").trim();
    const accountType = String(payload.accountType ?? "").trim();

    const anyBankProvided =
      bankName.length > 0 ||
      accountName.length > 0 ||
      accountNumber.length > 0 ||
      accountType.length > 0;

    if (anyBankProvided) {
      const bankMissing = [];
      if (!bankName) bankMissing.push("bankName");
      if (!accountName) bankMissing.push("accountName");
      if (!accountNumber) bankMissing.push("accountNumber");
      if (!accountType) bankMissing.push("accountType");

      if (bankMissing.length) {
        return res.status(400).json({
          success: false,
          message: `Incomplete bank details: ${bankMissing.join(", ")}`,
        });
      }

      if (!/^\d{10}$/.test(accountNumber)) {
        return res.status(400).json({
          success: false,
          message: "Account number must be 10 digits",
        });
      }
    }

    const doc = await RedemptionRequest.create({
      investmentId: payload.investmentId,
      date: payload.date,
      fundType: payload.fundType,
      amountFigures: String(payload.amountFigures),
      amountWords: payload.amountWords,
      redemptionType: payload.redemptionType,
      fullName: payload.fullName,
      address: payload.address,
      city: payload.city,
      lga: payload.lga,
      state: payload.state,
      phone: payload.phone,
      email: payload.email,
      bankName: payload.bankName,
      accountName: payload.accountName,
      accountNumber: payload.accountNumber,
      accountType: payload.accountType,
    });

    return res.status(201).json({
      success: true,
      message: "Redemption request submitted",
      data: { id: doc._id },
    });
  } catch (error) {
    console.error("Create redemption request error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
