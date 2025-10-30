import axios from "axios";

export const API_URL =
  import.meta.env.MODE === "production" ? "/api" : "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// // Optionally include an API key for trusted systems (e.g., admin routes)
// // IMPORTANT: Shipping a static API key to browsers is insecure. Prefer server-side usage.
// // If you still need it for local admin UI, set VITE_API_KEY in your client env files.
// const API_KEY = (import.meta.env.VITE_API_KEY as string | undefined)?.trim();

// // Set default header globally when available (useful if some calls bypass our interceptor)
// if (API_KEY) {
//   api.defaults.headers.common["x-api-key"] = API_KEY;
// }

// // Inject x-api-key on admin endpoints only
// api.interceptors.request.use((config) => {
//   const url = (config.url || "").toString();
//   // Requests typically use paths like "/admin/..." with baseURL "/api"
//   const isAdminRoute = url.startsWith("/admin") || url.includes("/api/admin");

//   if (isAdminRoute && API_KEY) {
//     // Ensure headers object exists
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const headers: any = config.headers || {};
//     headers["x-api-key"] = API_KEY;
//     config.headers = headers;
//   }

//   return config;
// });

// Allow runtime override if you want to set the key dynamically (optional)
// export const setApiKeyHeader = (key: string | null) => {
//   if (key && key.trim()) {
//     api.defaults.headers.common["x-api-key"] = key.trim();
//   } else {
//     delete api.defaults.headers.common["x-api-key"];
//   }
// };

// Extract a useful error message from Axios/server responses
export const getApiErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | {
          message?: string;
          error?: string;
          success?: boolean;
          errors?: string[];
        }
      | undefined;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (Array.isArray(data?.errors) && data.errors.length)
      return data.errors[0];
    if (err.message) return err.message;
  }
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred";
};
