import { useQuery } from "@tanstack/react-query";

export type BusinessOverview = {
  galleryImages: number;
  totalServices: number;
  totalReviews: number;
  totalQuotes: number;
};

export type QuoteRequest = {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  serviceNeeded: string;
  projectDetails: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  createdAt: string;
};

type ApiResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
};

type QuoteResponse = ApiResponse<QuoteRequest[]> & {
  meta: { page: number; limit: number; total: number };
};

const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("The dashboard API is not configured.");
  return apiUrl.replace(/\/$/, "");
};

async function getJson<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const result = (await response.json()) as T & {
    success?: boolean;
    message?: string;
  };

  if (!response.ok || result.success === false) {
    throw new Error(result.message || "Unable to load dashboard data.");
  }

  return result;
}

export const useBusinessOverview = (token?: string) =>
  useQuery<ApiResponse<BusinessOverview>>({
    queryKey: ["business-dashboard-overview"],
    queryFn: () => {
      if (!token) throw new Error("Please sign in to view the dashboard.");
      return getJson("/dashboard/business-overview", token);
    },
    enabled: Boolean(token),
    staleTime: 60 * 1000,
    retry: 1,
  });

export const useRecentBusinessQuotes = (token?: string) =>
  useQuery<QuoteResponse>({
    queryKey: ["business-recent-quotes", "pending", 10],
    queryFn: () => {
      if (!token) throw new Error("Please sign in to view quote requests.");
      return getJson(
        "/qoute/my-business?sortBy=createdAt&limit=10&page=1&status=pending",
        token,
      );
    },
    enabled: Boolean(token),
    staleTime: 60 * 1000,
    retry: 1,
  });
