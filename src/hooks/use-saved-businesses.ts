import { useQuery } from "@tanstack/react-query";

export type SavedBusiness = {
  id: string;
  savedAt: string;
  businessOwner: {
    businessOwnerId: string;
    businessName: string;
    category: string;
    city: string;
    state: string;
    address: string;
    serviceArea: string;
    businessWebsiteUrl: string;
    rating: number;
    totalReviews: number;
    service: {
      id: string;
      title: string;
      description: string;
      logo?: { url?: string; publicId?: string };
    };
  };
};

type SavedBusinessesResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  meta: { page: number; limit: number; total: number };
  data: SavedBusiness[];
};

const fetchSavedBusinesses = async (
  token: string,
  page: number,
  limit: number,
): Promise<SavedBusinessesResponse> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("The API service is not configured.");

  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const response = await fetch(`${apiUrl}/save-quote/my-saved?${params}`, {
    headers: { accept: "*/*", Authorization: `Bearer ${token}` },
  });
  const result = await response.json();

  if (!response.ok || !result?.success || !Array.isArray(result?.data)) {
    throw new Error(result?.message || "We couldn't load your saved services.");
  }
  return result;
};

export const useSavedBusinesses = (
  token: string | undefined,
  page: number,
  limit = 10,
  accountId?: string,
) =>
  useQuery<SavedBusinessesResponse>({
    queryKey: ["saved-businesses", accountId ?? "current-user", page, limit],
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view saved services.");
      return fetchSavedBusinesses(token, page, limit);
    },
    enabled: Boolean(token),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
    retry: 1,
  });
