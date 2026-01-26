const swaggerJsdoc = require("swagger-jsdoc");
const m2s = require("mongoose-to-swagger");
const path = require("path");

// Import your mongoose models (adjust paths)
let schemas = {};
try {
  const User = require("./models/User"); // adjust if different
  schemas.User = m2s(User, { omitFields: ["password", "__v"] });

  const RedemptionRequest = require("./models/RedemptionRequest");
  schemas.RedemptionRequest = m2s(RedemptionRequest, { omitFields: ["__v"] });

  // Enhance User schema with descriptions
  schemas.User.properties = schemas.User.properties || {};
  schemas.User.description = "User account information";

  // Enhance RedemptionRequest schema
  schemas.RedemptionRequest.properties =
    schemas.RedemptionRequest.properties || {};
  schemas.RedemptionRequest.description =
    "Investor funds redemption request submitted by a user";

  // Add descriptions to User properties
  if (schemas.User.properties.name) {
    schemas.User.properties.name.description = "User's full name";
  }
  if (schemas.User.properties.email) {
    schemas.User.properties.email.description =
      "User's email address (must be unique)";
  }
  if (schemas.User.properties.phone) {
    schemas.User.properties.phone.description = "User's phone number";
  }
  if (schemas.User.properties.role) {
    schemas.User.properties.role.description = "User's role in the system";
  }
  if (schemas.User.properties.isVerified) {
    schemas.User.properties.isVerified.description =
      "Whether the user has completed the verification process";
  }
  if (schemas.User.properties.emailVerified) {
    schemas.User.properties.emailVerified.description =
      "Whether the user's email has been verified";
  }
  if (schemas.User.properties.verification) {
    schemas.User.properties.verification.description =
      "User's verification information and status";
  }

  // Add verification status schema
  schemas.VerificationStatus = {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["none", "pending", "approved", "rejected"],
        description: "Current verification status",
      },
      isVerified: {
        type: "boolean",
        description: "Whether the user is verified",
      },
      rejectionReason: {
        type: "string",
        description: "Reason for rejection if status is rejected",
      },
      verifiedAt: {
        type: "string",
        format: "date-time",
        description: "Timestamp when the user was verified",
      },
      reviewedAt: {
        type: "string",
        format: "date-time",
        description: "Timestamp when the verification was reviewed",
      },
      reviewedBy: {
        type: "string",
        description: "ID of the admin who reviewed the verification",
      },
    },
  };

  // Add login response schema
  schemas.LoginResponse = {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      token: { type: "string", description: "JWT authentication token" },
      user: { $ref: "#/components/schemas/User" },
    },
  };

  // Add registration response schema
  schemas.RegistrationResponse = {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: {
        type: "string",
        example: "Registration successful. Please verify your email.",
      },
    },
  };

  // Redemption request schema for creation (includes confirmAuthorized which is not persisted)
  schemas.RedemptionRequestCreate = {
    type: "object",
    required: [
      "investmentId",
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
      "confirmAuthorized",
    ],
    properties: {
      investmentId: {
        type: "string",
        example: "INV-12345",
        description: "Investor's investment identifier",
      },
      date: {
        type: "string",
        example: "2026-01-26",
        description:
          "Request date (YYYY-MM-DD). Server assigns submission date; any client-provided value is ignored.",
      },
      fundType: {
        type: "string",
        enum: ["ethical", "equity", "debt"],
        example: "ethical",
      },
      amountFigures: {
        type: "string",
        example: "250000",
        description: "Amount in figures (string; commas removed client-side)",
      },
      amountWords: {
        type: "string",
        example: "Two Hundred and Fifty Thousand Naira",
      },
      redemptionType: {
        type: "string",
        enum: ["partial", "full"],
        example: "partial",
      },
      fullName: { type: "string", example: "John Doe" },
      address: { type: "string", example: "12, Example Street" },
      city: { type: "string", example: "Lagos" },
      lga: { type: "string", example: "Ikeja" },
      state: { type: "string", example: "Lagos" },
      phone: { type: "string", example: "08012345678" },
      email: { type: "string", format: "email", example: "john@example.com" },

      bankName: { type: "string", example: "Example Bank" },
      accountName: { type: "string", example: "John Doe" },
      accountNumber: {
        type: "string",
        example: "0123456789",
        description:
          "10-digit account number (required if any bank field is provided)",
      },
      accountType: {
        type: "string",
        enum: ["savings", "current", "domiciliary"],
        example: "savings",
      },

      confirmAuthorized: {
        type: "boolean",
        example: true,
        description: "Must be true to submit",
      },
    },
  };

  schemas.RedemptionRequestCreateResponse = {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Redemption request submitted" },
      data: {
        type: "object",
        properties: {
          id: { type: "string", example: "65b3b5f7a0c1e9a4d0c0d123" },
        },
      },
    },
  };

  schemas.ErrorResponse = {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      message: { type: "string", example: "Validation error" },
    },
  };
} catch (_) {
  // Model not found yet; you can add later.
}

const definition = {
  openapi: "3.0.3",
  info: {
    title: "Finance Teque API",
    version: "1.0.0",
    description: "API documentation for Finance Teque application",
    contact: {
      name: "Finance Teque Support",
      email: "support@financeteque.com",
    },
  },
  servers: [
    { url: "https://financetequecv.com", description: "Production server" },
    { url: "http://localhost:3000", description: "Development server" },
  ],
  tags: [
    {
      name: "Auth",
      description: "Authentication and user management endpoints",
    },
    {
      name: "Verification",
      description: "User verification and document upload endpoints",
    },
    { name: "Admin", description: "Admin-only endpoints for user management" },
    { name: "Redemption", description: "Investor fund redemption endpoints" },
  ],
  components: {
    securitySchemes: {
      // Add Bearer scheme for Authorization header
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "Paste the access token from login. Do not include the word 'Bearer'.",
      },
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "x-api-key",
        description: "Static API key for trusted systems",
      },
    },
    schemas, // populated from mongoose-to-swagger with enhancements
  },
  // Default security: allow either Bearer token OR API key.
  // Individual routes can still override with their own `security` blocks.
  security: [{ bearerAuth: [] }, { ApiKeyAuth: [] }],
};

module.exports = swaggerJsdoc({
  definition,
  apis: [
    // JSDoc-annotated route files
    path.join(__dirname, "routes/**/*.js"),
  ],
});
