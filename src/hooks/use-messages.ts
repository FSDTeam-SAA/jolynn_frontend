import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface ApiAttachment {
  url: string;
  public_id?: string;
  resource_type?: string;
  name?: string;
}

export interface ApiUserRef {
  _id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  profilePicture?: string;
  businessName?: string;
}

export interface ApiConversation {
  _id: string;
  userId: ApiUserRef;
  businessOwnerId: ApiUserRef;
  subject: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadForUser?: number;
  unreadForBusinessOwner?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  message: string;
  attachments?: ApiAttachment[];
  read?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ConversationsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: ApiConversation[];
}

export interface ConversationDetailsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    conversation: ApiConversation;
    messages: ApiMessage[];
  };
}

const getApiUrl = () => {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!apiUrl) throw new Error("The message API URL is not configured.");
  return apiUrl.replace(/\/$/, "");
};

// Fetch User Conversations (Website)
export const useUserConversations = (token?: string, page = 1, limit = 20) =>
  useQuery<ConversationsResponse>({
    queryKey: ["user-conversations", page, limit],
    queryFn: async () => {
      if (!token) throw new Error("Please sign in to view conversations.");
      const response = await fetch(
        `${getApiUrl()}/messages/my?page=${page}&limit=${limit}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch conversations.");
      }
      return result;
    },
    enabled: Boolean(token),
    refetchInterval: 10000,
  });

// Fetch Business Conversations (Dashboard)
export const useBusinessConversations = (
  token?: string,
  page = 1,
  limit = 20
) =>
  useQuery<ConversationsResponse>({
    queryKey: ["business-conversations", page, limit],
    queryFn: async () => {
      if (!token) throw new Error("Please sign in to view conversations.");
      const response = await fetch(
        `${getApiUrl()}/messages/business?page=${page}&limit=${limit}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch conversations.");
      }
      return result;
    },
    enabled: Boolean(token),
    refetchInterval: 10000,
  });

// Fetch User Single Conversation Messages
export const useUserConversationMessages = (
  conversationId?: string,
  token?: string
) =>
  useQuery<ConversationDetailsResponse>({
    queryKey: ["user-conversation-messages", conversationId],
    queryFn: async () => {
      if (!token || !conversationId) throw new Error("Missing params.");
      const response = await fetch(
        `${getApiUrl()}/messages/my/${encodeURIComponent(conversationId)}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch conversation.");
      }
      return result;
    },
    enabled: Boolean(token && conversationId),
    refetchInterval: 5000,
  });

// Fetch Business Single Conversation Messages
export const useBusinessConversationMessages = (
  conversationId?: string,
  token?: string
) =>
  useQuery<ConversationDetailsResponse>({
    queryKey: ["business-conversation-messages", conversationId],
    queryFn: async () => {
      if (!token || !conversationId) throw new Error("Missing params.");
      const response = await fetch(
        `${getApiUrl()}/messages/business/${encodeURIComponent(
          conversationId
        )}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch conversation.");
      }
      return result;
    },
    enabled: Boolean(token && conversationId),
    refetchInterval: 5000,
  });

// Reply as User (Website)
export const useSendUserReply = (token?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      conversationId,
      message,
      files,
    }: {
      conversationId: string;
      message: string;
      files?: File[];
    }) => {
      if (!token) throw new Error("Please sign in to reply.");
      const formData = new FormData();
      formData.append("message", message);
      if (files && files.length > 0) {
        files.forEach((file) => formData.append("attachments", file));
      }

      const response = await fetch(
        `${getApiUrl()}/messages/my/${encodeURIComponent(
          conversationId
        )}/reply`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to send message.");
      }
      return { conversationId, data: result.data };
    },
    onSuccess: ({ conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: ["user-conversation-messages", conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["user-conversations"] });
    },
    onError: (err: unknown) => {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("Failed to send message.");
    },
  });
};

// Reply as Business (Dashboard)
export const useSendBusinessReply = (token?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      conversationId,
      message,
      files,
    }: {
      conversationId: string;
      message: string;
      files?: File[];
    }) => {
      if (!token) throw new Error("Please sign in to reply.");
      const formData = new FormData();
      formData.append("message", message);
      if (files && files.length > 0) {
        files.forEach((file) => formData.append("attachments", file));
      }

      const response = await fetch(
        `${getApiUrl()}/messages/business/${encodeURIComponent(
          conversationId
        )}/reply`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to send message.");
      }
      return { conversationId, data: result.data };
    },
    onSuccess: ({ conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: ["business-conversation-messages", conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["business-conversations"] });
    },
    onError: (err: unknown) => {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("Failed to send message.");
    },
  });
};

// Create Conversation (POST /messages)
export const useCreateConversation = (token?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      businessOwnerId,
      subject,
      message,
      files,
    }: {
      businessOwnerId: string;
      subject: string;
      message: string;
      files?: File[];
    }) => {
      if (!token) throw new Error("Please sign in to start a conversation.");
      const formData = new FormData();
      formData.append("businessOwnerId", businessOwnerId);
      formData.append("subject", subject);
      formData.append("message", message);
      if (files && files.length > 0) {
        files.forEach((file) => formData.append("attachments", file));
      }

      const response = await fetch(`${getApiUrl()}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to start conversation.");
      }
      return result.data; // { conversation, message }
    },
    onSuccess: () => {
      toast.success("Conversation created successfully");
      queryClient.invalidateQueries({ queryKey: ["user-conversations"] });
    },
    onError: (err: unknown) => {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("Failed to start conversation.");
    },
  });
};
