import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface QuoteReplyItem {
  _id: string;
  qouteId: string;
  senderId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    businessName?: string;
    profilePicture?: string;
  };
  recipientId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    businessName?: string;
    profilePicture?: string;
  };
  senderRole: "user" | "businessOwner";
  subject: string;
  description: string;
  createdAt: string;
}

const getApiUrl = () => {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!apiUrl) throw new Error("The quote API URL is not configured.");
  return apiUrl.replace(/\/$/, "");
};

// Reply to Quote as Business Owner (Dashboard)
export const useBusinessQuoteReply = (token?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      quoteId,
      subject,
      description,
    }: {
      quoteId: string;
      subject: string;
      description: string;
    }) => {
      if (!token) throw new Error("Please sign in to reply.");
      const response = await fetch(
        `${getApiUrl()}/qoute/my-business/${encodeURIComponent(quoteId)}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ subject, description }),
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to submit quote reply.");
      }
      return { quoteId, data: result.data };
    },
    onSuccess: ({ quoteId }) => {
      toast.success("Quote reply sent successfully!");
      queryClient.invalidateQueries({ queryKey: ["business-quote-requests"] });
      queryClient.invalidateQueries({ queryKey: ["quote-replies", quoteId] });
    },
    onError: (err: unknown) => {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("Failed to submit quote reply.");
    },
  });
};

// Reply to Quote as User (Website)
export const useUserQuoteReply = (token?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      quoteId,
      subject,
      description,
    }: {
      quoteId: string;
      subject: string;
      description: string;
    }) => {
      if (!token) throw new Error("Please sign in to reply.");
      const response = await fetch(
        `${getApiUrl()}/qoute/my/${encodeURIComponent(quoteId)}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ subject, description }),
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to submit quote reply.");
      }
      return { quoteId, data: result.data };
    },
    onSuccess: ({ quoteId }) => {
      toast.success("Quote reply sent successfully!");
      queryClient.invalidateQueries({ queryKey: ["my-quote-requests"] });
      queryClient.invalidateQueries({ queryKey: ["quote-replies", quoteId] });
    },
    onError: (err: unknown) => {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("Failed to submit quote reply.");
    },
  });
};

// Get Quote Replies List
export const useQuoteReplies = (
  quoteId?: string,
  mode: "business" | "user" = "business",
  token?: string
) =>
  useQuery<{ data: QuoteReplyItem[] }>({
    queryKey: ["quote-replies", mode, quoteId],
    queryFn: async () => {
      if (!token || !quoteId) throw new Error("Missing params.");
      const endpoint =
        mode === "business"
          ? `/qoute/my-business/${encodeURIComponent(quoteId)}/replies`
          : `/qoute/my/${encodeURIComponent(quoteId)}/replies`;

      const response = await fetch(`${getApiUrl()}${endpoint}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch quote replies.");
      }
      return result;
    },
    enabled: Boolean(token && quoteId),
  });
