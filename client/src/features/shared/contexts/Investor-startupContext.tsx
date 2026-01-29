import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import { api, getApiErrorMessage } from "@/lib/api";
import type {
  FormValues,
  RedemptionFormValues,
  StartupFormValues,
} from "../schema";
import type { verificationStatusResponse } from "@/types/verification";
import type { CorporateVerificationForm } from "@/features/investors/corporate/schema";

interface InvestorContextType {
  loading: boolean;
  submitVerification: (
    verificationData: FormValues | StartupFormValues,
  ) => Promise<void>;
  verificationStatus: () => Promise<verificationStatusResponse>;
  verificationSubmitted: boolean;
  verStatus: verStatus | null;
  submitCorporateVerification: (
    data: CorporateVerificationForm,
  ) => Promise<void>;
  submitRedemptionRequest: (values: RedemptionFormValues) => Promise<void>;
  getRedemptionBankDetails: () => Promise<
    Pick<
      RedemptionFormValues,
      "bankName" | "accountName" | "accountNumber" | "accountType"
    >
  >;
}

const InvestorContext = createContext<InvestorContextType | undefined>(
  undefined,
);
type verStatus = {
  status: "approved" | "pending" | "rejected" | "";
  isVerified: boolean;
  rejectionReason?: string;
  reviewedAt?: string;
  submittedAt?: string;
};

export function InvestorProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [verStatus, setVerStatus] = useState<verStatus | null>(null);
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);

  const toFile = (value: unknown, label: string): File => {
    if (value instanceof File) return value;

    // handle accidental FileList storage
    if (value && typeof value === "object" && "length" in value) {
      const fileList = value as FileList;
      const first = fileList[0];
      if (first instanceof File) return first;
    }

    throw new Error(`${label} is required. Please upload a valid file.`);
  };

  const submitVerification = useCallback(
    async (verificationData: FormValues | StartupFormValues) => {
      const {
        identificationDocument,
        passportPhoto,
        utilityBill,
        ...textFields
      } = verificationData;

      const submitTextfields = async (fields: Record<string, unknown>) => {
        const response = await api.post(`/verification`, fields);
        return response.data;
      };

      const submitDocs = async (docs: {
        identificationDocument: File;
        passportPhoto: File;
        utilityBill: File;
      }) => {
        const formData = new FormData();
        formData.append("identificationDocument", docs.identificationDocument);
        formData.append("passportPhoto", docs.passportPhoto);
        formData.append("utilityBill", docs.utilityBill);

        // IMPORTANT: do not set Content-Type manually (boundary matters)
        const response = await api.post(`/verification/documents`, formData);
        return response.data;
      };

      try {
        setLoading(true);
        await submitTextfields(textFields);

        await submitDocs({
          identificationDocument: toFile(
            identificationDocument,
            "Identification document",
          ),
          passportPhoto: toFile(passportPhoto, "Passport photo"),
          utilityBill: toFile(utilityBill, "Utility bill"),
        });

        setVerificationSubmitted(true);
      } catch (error) {
        const message = getApiErrorMessage(error);
        throw new Error(message || "Failed to submit verification data");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const verificationStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/verification/status`);
      setVerStatus(response.data.data); // fix: server returns { data: {...} }
      return response.data.data;
    } catch (error) {
      const message = getApiErrorMessage(error);
      throw new Error(message || "Failed to fetch verification status");
    } finally {
      setLoading(false);
    }
  }, []);

  const submitCorporateVerification = useCallback(
    async (data: CorporateVerificationForm) => {
      const { company, bankDetails, documents, signatories, referral } = data;

      const textPayload = {
        company: { ...company, logo: undefined },
        bankDetails,
        signatories: signatories.map(
          ({ fullName, position, phoneNumber, bvnNumber, email }) => ({
            fullName,
            position,
            phoneNumber,
            bvnNumber,
            email,
          }),
        ),
        referral,
      };

      const submitText = async () => {
        const res = await api.post(`/verification/corporate`, textPayload);
        return res.data;
      };

      const submitDocs = async () => {
        const fd = new FormData();

        if (company.logo)
          fd.append("companyLogo", toFile(company.logo, "Company logo"));

        fd.append(
          "certificateOfIncorporation",
          toFile(
            documents.certificateOfIncorporation,
            "Certificate of Incorporation",
          ),
        );
        fd.append("utilityBill", toFile(documents.utilityBill, "Utility bill"));

        if (documents.memorandumAndArticles) {
          fd.append(
            "memorandumAndArticles",
            toFile(documents.memorandumAndArticles, "Memorandum and Articles"),
          );
        }
        if (documents.tinCertificate) {
          fd.append(
            "tinCertificate",
            toFile(documents.tinCertificate, "TIN certificate"),
          );
        }

        signatories.forEach((s, i) => {
          if (s.idDocument) {
            fd.append(
              `signatories[${i}][idDocument]`,
              toFile(s.idDocument, `Signatory ${i + 1} ID document`),
            );
          }
          // API supports signature too; append if your form collects it
          const signatory = s as typeof s & { signature?: File };
          if (signatory.signature) {
            fd.append(
              `signatories[${i}][signature]`,
              toFile(signatory.signature, `Signatory ${i + 1} signature`),
            );
          }
        });

        // IMPORTANT: do not set Content-Type manually
        const res = await api.post(`/verification/corporate/documents`, fd);
        return res.data;
      };

      try {
        setLoading(true);
        await submitText();
        await submitDocs();
        setVerificationSubmitted(true);
      } catch (error) {
        const message = getApiErrorMessage(error);
        throw new Error(message || "Failed to submit corporate verification");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const submitRedemptionRequest = useCallback(
    async (values: RedemptionFormValues) => {
      try {
        setLoading(true);
        await api.post("/redemption", values);
      } catch (error) {
        const message = getApiErrorMessage(error);
        throw new Error(message || "Failed to submit redemption request");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getRedemptionBankDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/redemption/bank-details");
      return (
        res.data?.data || {
          bankName: "",
          accountName: "",
          accountNumber: "",
          accountType: "",
        }
      );
    } catch (error) {
      const message = getApiErrorMessage(error);
      throw new Error(message || "Failed to fetch bank details");
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      submitVerification,
      verificationStatus,
      loading,
      verificationSubmitted,
      verStatus,
      submitCorporateVerification,
      submitRedemptionRequest,
      getRedemptionBankDetails,
    }),
    [
      submitVerification,
      verificationStatus,
      loading,
      verificationSubmitted,
      verStatus,
      submitCorporateVerification,
      submitRedemptionRequest,
      getRedemptionBankDetails,
    ],
  );
  return (
    <InvestorContext.Provider value={value}>
      {children}
    </InvestorContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useInvestor = () => {
  const context = useContext(InvestorContext);
  if (context === undefined) {
    throw new Error("useInvestor must be used within an InvestorProvider");
  }
  return context;
};
