"use client";

import DeleteModal from "@/components/modals/delete-modal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Reply,
  Send,
  Loader2,
  MessageSquareDot,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useBusinessQuoteReply, useQuoteReplies } from "@/hooks/use-quote-replies";

type QuoteRequest = {
  _id: string;
  userId?: string;
  businessOwnerId: string;
  businessOwnerName: string;
  name: string;
  email: string;
  phoneNumber: string;
  serviceNeeded: string;
  projectDetails: string;
  status: "pending" | "inProgress" | "responded" | "closed" | "accepted" | "rejected" | "completed";
  isReplied?: boolean;
  createdAt: string;
  updatedAt: string;
};

type QuoteRequestsResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  meta: { page: number; limit: number; total: number };
  data: QuoteRequest[];
};

type QuoteRequestResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: QuoteRequest;
};

const PAGE_LIMIT = 10;
const READ_STORAGE_KEY = "read_quote_reply_ids";

const getApiUrl = () => {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!apiUrl) throw new Error("The quote API is not configured.");
  return apiUrl.replace(/\/$/, "");
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "—", time: "" };
  return {
    date: new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date),
    time: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date),
  };
};

function QuateRequest() {
  const { data: session, status: sessionStatus } = useSession();
  const user = session?.user as { token?: string; accessToken?: string } | undefined;
  const token = user?.accessToken ?? user?.token;
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [replyingRequest, setReplyingRequest] = useState<QuoteRequest | null>(null);
  const [requestToDelete, setRequestToDelete] = useState<QuoteRequest | null>(null);

  // Local storage state for read quotes
  const [readQuoteIds, setReadQuoteIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(READ_STORAGE_KEY);
      if (saved) setReadQuoteIds(JSON.parse(saved));
    } catch {}
  }, []);

  const markAsRead = (quoteId: string, updatedAt?: string) => {
    const readKey = updatedAt ? `${quoteId}_${updatedAt}` : quoteId;
    setReadQuoteIds((prev) => {
      if (prev.includes(readKey)) return prev;
      const updated = Array.from(new Set([...prev, readKey, quoteId]));
      try {
        localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleOpenDetails = (request: QuoteRequest) => {
    setSelectedRequest(request);
    markAsRead(request._id, request.updatedAt);
  };

  // Reply Form State
  const [replySubject, setReplySubject] = useState("");
  const [replyDescription, setReplyDescription] = useState("");

  const replyMutation = useBusinessQuoteReply(token);

  const quoteQuery = useQuery<QuoteRequestsResponse>({
    queryKey: ["business-quote-requests", page],
    queryFn: async () => {
      if (!token) throw new Error("Please sign in to view quote requests.");
      const params = new URLSearchParams({
        sortBy: "createdAt",
        limit: String(PAGE_LIMIT),
        page: String(page),
      });
      const response = await fetch(`${getApiUrl()}/qoute/my-business?${params}`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      const result = (await response.json().catch(() => null)) as QuoteRequestsResponse | null;
      if (!response.ok || !result?.success || !Array.isArray(result.data)) {
        throw new Error(result?.message || "Unable to load quote requests.");
      }
      return result;
    },
    enabled: Boolean(token),
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
    retry: 1,
  });

  const quoteRequests = quoteQuery.data?.data ?? [];
  const total = quoteQuery.data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const isLoading = sessionStatus === "loading" || (Boolean(token) && quoteQuery.isPending);

  const openReplyModal = (req: QuoteRequest) => {
    setReplyingRequest(req);
    markAsRead(req._id, req.updatedAt);
    setReplySubject(`Reply regarding ${req.serviceNeeded}`);
    setReplyDescription("");
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingRequest || !replySubject.trim() || !replyDescription.trim()) {
      toast.error("Please fill in both subject and message.");
      return;
    }

    replyMutation.mutate(
      {
        quoteId: replyingRequest._id,
        subject: replySubject.trim(),
        description: replyDescription.trim(),
      },
      {
        onSuccess: () => {
          markAsRead(replyingRequest._id, replyingRequest.updatedAt);
          setReplyingRequest(null);
          setReplySubject("");
          setReplyDescription("");
        },
      }
    );
  };

  const deleteMutation = useMutation<
    QuoteRequestResponse,
    Error,
    QuoteRequest
  >({
    mutationFn: async (request) => {
      if (!token) throw new Error("Please sign in to delete this quote request.");
      const response = await fetch(
        `${getApiUrl()}/qoute/my-business/${encodeURIComponent(request._id)}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = (await response.json().catch(() => null)) as
        | QuoteRequestResponse
        | null;
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to delete quote request.");
      }
      return result;
    },
    onSuccess: async (result, deletedRequest) => {
      toast.success(result.message || "Quote request deleted successfully.");
      setRequestToDelete(null);
      if (selectedRequest?._id === deletedRequest._id) {
        setSelectedRequest(null);
      }
      if (quoteRequests.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
      await queryClient.invalidateQueries({
        queryKey: ["business-quote-requests"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["business-dashboard-overview"],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <section className="overflow-hidden rounded-[10px] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse text-left">
          <thead>
            <tr className="h-[52px] border-b border-[#EAECF0] text-[14px] font-medium text-[#526174]">
              <th className="w-[14%] px-5 text-center font-medium">Name</th>
              <th className="w-[15%] px-3 text-center font-medium">Email Address</th>
              <th className="w-[13%] px-3 text-center font-medium">Phone Number</th>
              <th className="w-[12%] px-3 text-center font-medium">Date &amp; time</th>
              <th className="w-[14%] px-3 text-center font-medium">Service</th>
              <th className="w-[14%] px-3 text-center font-medium">Status &amp; Replies</th>
              <th className="w-[12%] px-3 text-center font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, rowIndex) => (
                <tr key={rowIndex} className="h-[85px] border-b border-[#EAECF0]">
                  {Array.from({ length: 7 }).map((__, cellIndex) => (
                    <td key={cellIndex} className="px-3">
                      <Skeleton className="mx-auto h-4 w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              quoteRequests.map((request) => {
                const createdAt = formatDateTime(request.createdAt);
                const isReplied = request.isReplied || request.status === "responded";
                const readKey = request.updatedAt ? `${request._id}_${request.updatedAt}` : request._id;
                const isUnread = !readQuoteIds.includes(readKey);

                return (
                  <tr
                    key={request._id}
                    className={`h-[90px] border-b border-[#EAECF0] text-[14px] text-[#66758A] last:border-b-0 transition-colors ${
                      isUnread ? "bg-indigo-50/40 font-medium" : ""
                    }`}
                  >
                    <td className="px-5 text-center font-medium text-slate-800">{request.name}</td>
                    <td className="px-3 text-center">{request.email}</td>
                    <td className="whitespace-nowrap px-3 text-center">{request.phoneNumber}</td>
                    <td className="px-3 text-center leading-[21px]">
                      <span className="block">{createdAt.date}</span>
                      <span className="block text-[#98A2B3]">{createdAt.time}</span>
                    </td>
                    <td className="px-3 text-center font-medium">{request.serviceNeeded}</td>

                    {/* Status & Replies Indicator Column */}
                    <td className="px-3 text-center">
                      {isUnread ? (
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(request)}
                          title="Click to view quote details"
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                            isReplied
                              ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
                              : "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                          }`}
                        >
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                          </span>
                          {isReplied ? "New Reply" : "New Request"}
                        </button>
                      ) : isReplied ? (
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(request)}
                          title="Click to view reply history"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 hover:bg-indigo-200"
                        >
                          Replied
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Pending Reply
                        </span>
                      )}
                    </td>

                    {/* Action Column */}
                    <td className="px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Reply Button */}
                        <button
                          type="button"
                          onClick={() => openReplyModal(request)}
                          title={isReplied ? "Edit quote reply" : "Reply to quote"}
                          className="inline-flex h-8 px-2.5 gap-1 items-center justify-center rounded-lg bg-[#4F59F6] text-white font-semibold text-xs transition-colors hover:bg-[#3D46E0] shadow-sm"
                        >
                          <Reply className="h-3.5 w-3.5" />
                          <span>{isReplied ? "Replied" : "Reply"}</span>
                        </button>

                        {/* View Details */}
                        <button
                          type="button"
                          aria-label={`View quote request from ${request.name}`}
                          onClick={() => handleOpenDetails(request)}
                          title="View details and reply history"
                          className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF2FF] text-[#30347F] transition-colors hover:bg-[#DDE4FF]"
                        >
                          <Eye className="h-[17px] w-[17px]" />
                          {isUnread && (
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-600 rounded-full ring-2 ring-white animate-pulse" />
                          )}
                        </button>

                        {/* Delete Quote */}
                        <button
                          type="button"
                          disabled={deleteMutation.isPending}
                          onClick={() => setRequestToDelete(request)}
                          aria-label={`Delete quote request from ${request.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF0EF] text-[#FF3434] transition-colors hover:bg-[#FFD9D6] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-[17px] w-[17px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && (quoteQuery.isError || !token) && (
        <div className="px-6 py-14 text-center">
          <p className="text-base text-red-600">
            {quoteQuery.error instanceof Error
              ? quoteQuery.error.message
              : "Please sign in to view quote requests."}
          </p>
          {token && (
            <button
              type="button"
              onClick={() => quoteQuery.refetch()}
              className="mt-3 text-base font-semibold text-[#30347F] hover:underline"
            >
              Try again
            </button>
          )}
        </div>
      )}

      {!isLoading && !quoteQuery.isError && token && quoteRequests.length === 0 && (
        <div className="px-6 py-14 text-center text-base text-[#667085]">
          No quote requests found.
        </div>
      )}

      {!isLoading && !quoteQuery.isError && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#EAECF0] px-5 py-3">
          <p className="text-sm text-[#667085]">
            Showing {(page - 1) * PAGE_LIMIT + 1}–{Math.min(page * PAGE_LIMIT, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous page"
              disabled={page === 1 || quoteQuery.isFetching}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D0D5DD] disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-[#344054]">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={page >= totalPages || quoteQuery.isFetching}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D0D5DD] disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      <Dialog open={Boolean(selectedRequest)} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-h-[90vh] max-w-[560px] overflow-y-auto rounded-[16px] bg-white p-6">
          <DialogHeader className="border-b border-slate-100 pb-4">
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center justify-between">
              <span>Quote Request Details</span>
              {selectedRequest?.isReplied && (
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                  Replied
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <QuoteDetailsContent
              request={selectedRequest}
              token={token}
              onClose={() => setSelectedRequest(null)}
              onOpenReply={() => {
                const req = selectedRequest;
                setSelectedRequest(null);
                openReplyModal(req);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* REPLY MODAL */}
      <Dialog open={Boolean(replyingRequest)} onOpenChange={(open) => !open && setReplyingRequest(null)}>
        <DialogContent className="max-h-[90vh] max-w-[550px] overflow-y-auto rounded-[16px] bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Reply className="w-5 h-5 text-indigo-600" />
              Reply to Quote Request
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Sending reply to <span className="font-semibold text-slate-800">{replyingRequest?.name}</span> ({replyingRequest?.email})
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendReply} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
                placeholder="Enter reply subject..."
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Message / Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={replyDescription}
                onChange={(e) => setReplyDescription(e.target.value)}
                placeholder="Write your response message here..."
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReplyingRequest(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={replyMutation.isPending}
                className="px-5 py-2 text-xs font-bold text-white bg-[#4F59F6] hover:bg-[#3D46E0] rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-60 transition-colors"
              >
                {replyMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{replyMutation.isPending ? "Sending..." : "Submit Reply"}</span>
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteModal
        isOpen={Boolean(requestToDelete)}
        onClose={() => !deleteMutation.isPending && setRequestToDelete(null)}
        onConfirm={() =>
          requestToDelete &&
          !deleteMutation.isPending &&
          deleteMutation.mutate(requestToDelete)
        }
        title={
          deleteMutation.isPending
            ? "Deleting Quote Request..."
            : "Delete Quote Request?"
        }
        desc={`Are you sure you want to delete ${requestToDelete?.name || "this customer's"} quote request? This action cannot be undone.`}
      />
    </section>
  );
}

function QuoteDetailsContent({
  request,
  token,
  onClose,
  onOpenReply,
}: {
  request: QuoteRequest;
  token?: string;
  onClose: () => void;
  onOpenReply: () => void;
}) {
  const { data: repliesResponse, isPending } = useQuoteReplies(request._id, "business", token);
  const replies = repliesResponse?.data || [];

  return (
    <div className="space-y-4 pt-2">
      {/* Clean compact summary banner */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Requested By</span>
          <p className="text-sm font-bold text-slate-800">{request.name}</p>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Service</span>
          <p className="text-sm font-bold text-indigo-600">{request.serviceNeeded}</p>
        </div>
      </div>

      {/* Project Details */}
      <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-3.5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Project Details</p>
        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{request.projectDetails}</p>
      </div>

      {/* REPLIES HISTORY SECTION */}
      <div className="border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <MessageSquareDot className="w-4 h-4 text-indigo-600" />
            <span>Replies History</span>
          </h4>
          <span className="text-[11px] font-semibold text-slate-400">
            {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </span>
        </div>

        {isPending ? (
          <div className="flex items-center gap-2 text-xs text-slate-400 py-3">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            <span>Loading replies...</span>
          </div>
        ) : replies.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl py-6 text-center">
            <p className="text-xs text-slate-400">No replies recorded yet for this quote.</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {replies.map((reply) => (
              <div
                key={reply._id}
                className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-3 text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="text-indigo-900">{reply.subject}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {new Date(reply.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{reply.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={onOpenReply}
          className="h-9 rounded-lg bg-[#4F59F6] px-4 text-xs font-bold text-white hover:bg-[#3D46E0] flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Reply className="w-3.5 h-3.5" />
          <span>Reply to Customer</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-9 rounded-lg bg-slate-100 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default QuateRequest;
