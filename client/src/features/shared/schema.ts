import { z } from "zod";
import type { LucideIcon } from "lucide-react";
import { User, Users, CreditCard, FileText } from "lucide-react";
import { stateAndLga } from "@/utils/stateAndLga";

// File constraints
const allowedImageTypes = ["image/jpeg", "image/png"];
const allowedDocTypes = ["application/pdf", ...allowedImageTypes];
const maxFileSize = 5 * 1024 * 1024; // 5MB

export const fileDocSchema = z
  .instanceof(File, { message: "File is required" })
  .refine((f) => f.size <= maxFileSize, { message: "Max file size is 5MB" })
  .refine((f) => allowedDocTypes.includes(f.type), {
    message: "Allowed types: PDF, JPG, PNG",
  });

export const fileImageSchema = z
  .instanceof(File, { message: "File is required" })
  .refine((f) => f.size <= maxFileSize, { message: "Max file size is 5MB" })
  .refine((f) => allowedImageTypes.includes(f.type), {
    message: "Allowed types: JPG, PNG",
  });

export const formSchema = z
  .object({
    // Bio Data
    firstName: z.string().min(2, "First name must be atleast 2 characters"),
    surname: z.string().min(2, "Surname must be atleast 2 characters"),
    phoneNumber: z
      .string()
      .min(10, {
        message: "Phone number must be at least 10 digits (e.g., 8012345678)",
      })
      .max(15, { message: "Phone number must not exceed 15 digits" })
      .refine((val) => /^\d+$/.test(val), {
        message: "Phone number must contain only digits",
      }),
    email: z.string().email("Valid email is required"),
    ageBracket: z.enum(["adult", "minor"], "Please select an option"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    localGovernment: z
      .string()
      .min(2, "Local government must be atleast 2 characters"),
    localGovernmentOther: z.string().optional(),
    residentialAddress: z
      .string()
      .min(5, "Residential address must be atleast 5 characters"),
    ninNumber: z.string().regex(/^\d{11}$/, "NIN must be 11 digits"),
    stateOfResidence: z
      .string()
      .min(2, "State of residence must be atleast 2 characters"),

    // Next of Kin
    kinFullName: z.string().min(2, "Full name must be atleast 2 characters"),
    kinPhoneNumber: z
      .string()
      .min(10, {
        message: "Phone number must be at least 10 digits (e.g., 8012345678)",
      })
      .max(15, { message: "Phone number must not exceed 15 digits" })
      .refine((val) => /^\d+$/.test(val), {
        message: "Phone number must contain only digits",
      }),
    kinEmail: z.string().email("Valid email is required"),
    kinResidentialAddress: z
      .string()
      .min(5, "Residential address must be atleast 5 characters"),
    kinRelationship: z.enum([
      "Spouse",
      "Sibling",
      "Parent",
      "Guardian",
      "Friend",
      "Other",
    ]),
    kinRelationshipOther: z.string().optional(),

    // Account Details
    accountName: z.string().min(2, "Account name must be atleast 2 characters"),
    accountNumber: z
      .string()
      .regex(/^\d{10}$/, "Account number must be 10 digits"),
    bankName: z.string().min(2, "Bank name must be atleast 2 characters"),
    bvnNumber: z.string().regex(/^\d{11}$/, "BVN must be 11 digits"),
    accountType: z.enum([
      "Savings",
      "Current",
      "Domiciliary",
      "Corporate",
      "Other",
    ]),
    accountTypeOther: z.string().optional(),

    // KYC Documents
    identificationDocument: fileDocSchema,
    passportPhoto: fileImageSchema,
    utilityBill: fileDocSchema,
  })
  .superRefine((data, ctx) => {
    if (
      data.kinRelationship === "Other" &&
      !data.kinRelationshipOther?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["kinRelationshipOther"],
        message: "Please specify the relationship",
      });
    }
    if (data.accountType === "Other" && !data.accountTypeOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["accountTypeOther"],
        message: "Please specify the account type",
      });
    }

    // LGA must match chosen state (or require Other text)
    const lgas = stateAndLga[data.stateOfResidence] ?? [];
    if (lgas.length > 0) {
      if (data.localGovernment === "Other") {
        if (!data.localGovernmentOther?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["localGovernmentOther"],
            message: "Please specify your Local Government",
          });
        }
      } else if (!lgas.includes(data.localGovernment)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["localGovernment"],
          message: "Select a valid Local Government for the chosen state",
        });
      }
    }
  });

// Create a separate schema for startup forms
export const startupFormSchema = formSchema.omit({ ageBracket: true });

// Update the FormValues type to include both scenarios
export type FormValues = z.infer<typeof formSchema>;
export type StartupFormValues = z.infer<typeof startupFormSchema>;

export type StepDef = {
  id: string;
  name: string;
  icon: LucideIcon;
  fields: (keyof FormValues)[];
};

export const steps: StepDef[] = [
  {
    id: "bio-data",
    name: "Bio Data",
    icon: User,
    fields: [
      "firstName",
      "surname",
      "phoneNumber",
      "email",
      "dateOfBirth",
      "localGovernment",
      "localGovernmentOther",
      "residentialAddress",
      "ninNumber",
      "stateOfResidence",
      "ageBracket",
    ],
  },
  {
    id: "next-of-kin",
    name: "Next of Kin",
    icon: Users,
    fields: [
      "kinFullName",
      "kinPhoneNumber",
      "kinEmail",
      "kinResidentialAddress",
      "kinRelationship",
      "kinRelationshipOther",
    ],
  },
  {
    id: "account-details",
    name: "Account Details",
    icon: CreditCard,
    fields: [
      "accountName",
      "accountNumber",
      "bankName",
      "bvnNumber",
      "accountType",
      "accountTypeOther",
    ],
  },
  {
    id: "kyc-documents",
    name: "KYC Documents",
    icon: FileText,
    fields: ["identificationDocument", "passportPhoto", "utilityBill"],
  },
];


// Redemption Form Schema
const baseSchema = z.object({
  investmentId: z.string().min(3, "Investment ID is required"),
  date: z.string().min(1, "Date is required"),

  fundType: z.enum(["ethical", "equity", "debt"] as const, {
    message: "Select a fund type",
  }),

  amountFigures: z
    .string()
    .transform((v) => v.replaceAll(",", "").trim())
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), "Enter a valid amount"),

  amountWords: z.string().min(5, "Amount in words is required"),

  redemptionType: z.enum(["partial", "full"] as const, {
    message: "Select redemption type",
  }),

  fullName: z.string().min(3, "Full name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City/Town is required"),
  lga: z.string().min(2, "LGA is required"),
  state: z.string().min(2, "State is required"),

  phone: z.string().min(7, "Phone number is required"),
  email: z.string().email("Enter a valid email"),

  bankName: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountType: z.string().optional(),

  confirmAuthorized: z
    .boolean()
    .refine((v) => v === true, "You must confirm this request is authorized"),
});

export const redemptionFormSchema = baseSchema.superRefine((values, ctx) => {
  const bankName = values.bankName?.trim() ?? "";
  const accountName = values.accountName?.trim() ?? "";
  const accountNumber = values.accountNumber?.trim() ?? "";
  const accountType = values.accountType?.trim() ?? "";

  const anyProvided =
    bankName.length > 0 ||
    accountName.length > 0 ||
    accountNumber.length > 0 ||
    accountType.length > 0;

  if (!anyProvided) return;

  if (!bankName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Bank name is required when providing bank details",
      path: ["bankName"],
    });
  }

  if (!accountName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Account name is required when providing bank details",
      path: ["accountName"],
    });
  }

  if (!accountNumber) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Account number is required when providing bank details",
      path: ["accountNumber"],
    });
  } else if (!/^\d{10}$/.test(accountNumber)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Account number must be 10 digits",
      path: ["accountNumber"],
    });
  }

  if (!accountType) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Account type is required when providing bank details",
      path: ["accountType"],
    });
  }
}) ;

export type RedemptionFormValues = z.infer<typeof redemptionFormSchema>;

