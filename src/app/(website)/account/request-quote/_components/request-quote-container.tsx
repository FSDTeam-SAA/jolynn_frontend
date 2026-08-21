"use client";

import { Skeleton } from "@/components/ui/skeleton";
import DeleteModal from "@/components/modals/delete-modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Eye,
  Inbox,
  Trash2,
  X,
  Reply,
  Send,
  Loader2,
  MessageSquareDot,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AccountPageShell, AccountSectionHeader } from "../../_components/account-ui";
import { useUserQuoteReply, useQuoteReplies } from "@/hooks/use-quote-replies";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type QuoteStatus = "pending" | "inProgress" | "responded" | "closed" | "accepted" | "rejected" | "completed";

type QuoteRequest = {
  _id: string;
  userId: string;
  businessOwnerId: string;
  businessOwnerName: string;
  name: string;
  email: string;
  phoneNumber: string;
  serviceNeeded: string;
  projectDetails: string;
  status: QuoteStatus;
  isReplied?: boolean;
  createdAt: string;
  updatedAt: string;
};

type QuoteRequestsResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: QuoteRequest[];
};

type DeleteQuoteResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: QuoteRequest;
};

const PAGE_LIMIT = 10;
const READ_STORAGE_KEY_USER = "read_user_quote_reply_ids";

const getApiUrl = () => {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!apiUrl) throw new Error("The quote API is not configured.");
  return apiUrl.replace(/\/$/, "");
};

const fetchQuoteRequests = async (
  token: string,
  page: number
): Promise<QuoteRequestsResponse> => {
  const params = new URLSearchParams({
    sortBy: "createdAt",
    limit: String(PAGE_LIMIT),
    page: String(page),
  });
  const response = await fetch(`${getApiUrl()}/qoute/my?${params}`, {
    headers: {
      Accept: "*/*",
      Authorization: `Bearer ${token}`,
    },
  });
  const result = (await response.json()) as QuoteRequestsResponse;

  if (!response.ok || !result.success || !Array.isArray(result.data)) {
    throw new Error(result.message || "Unable to load your quote requests.");
  }

  return result;
};

const QuoteTableSkeleton = () => (
  <div
    className="overflow-hidden rounded-[8px] border border-[#D9DEE7] bg-white"
    aria-label="Loading quote requests"
  >
    <div className="grid min-w-[900px] grid-cols-[1fr_0.8fr_1.4fr_0.75fr_0.8fr] border-b border-[#D9DEE7] px-4 py-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="mx-auto h-4 w-20" />
      ))}
    </div>
    {Array.from({ length: 5 }).map((_, rowIndex) => (
      <div
        key={rowIndex}
        className="grid min-w-[900px] grid-cols-[1fr_0.8fr_1.4fr_0.75fr_0.8fr] items-center gap-4 border-b border-[#E8ECF2] px-4 py-5 last:border-b-0"
      >
        <Skeleton className="mx-auto h-4 w-28" />
        <Skeleton className="mx-auto h-4 w-24" />
        <Skeleton className="mx-auto h-9 w-full max-w-[280px]" />
        <Skeleton className="mx-auto h-6 w-16 rounded-full" />
        <Skeleton className="mx-auto h-8 w-24" />
      </div>
    ))}
  </div>
);

const RequestQuoteContainer = () => {
  const queryClient = useQueryClient();
  const { data: session, status: sessionStatus } = useSession();
  const user = session?.user as
    | { id?: string; token?: string; accessToken?: string }
    | undefined;
  const token = user?.accessToken ?? user?.token;

  const [page, setPage] = useState(1);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [replyingQuote, setReplyingQuote] = useState<QuoteRequest | null>(null);
  const [quoteToDelete, setQuoteToDelete] = useState<QuoteRequest | null>(null);

  // Local storage state for read quotes
  const [readQuoteIds, setReadQuoteIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(READ_STORAGE_KEY_USER);
      if (saved) setReadQuoteIds(JSON.parse(saved));
    } catch {}
  }, []);

  const markAsRead = (quoteId: string, updatedAt?: string) => {
    const readKey = updatedAt ? `${quoteId}_${updatedAt}` : quoteId;
    setReadQuoteIds((prev) => {
      if (prev.includes(readKey)) return prev;
      const updated = Array.from(new Set([...prev, readKey, quoteId]));
      try {
        localStorage.setItem(READ_STORAGE_KEY_USER, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleOpenDetails = (quote: QuoteRequest) => {
    setSelectedQuote(quote);
    markAsRead(quote._id, quote.updatedAt);
  };

  // Reply Form State
  const [replySubject, setReplySubject] = useState("");
  const [replyDescription, setReplyDescription] = useState("");

  const replyMutation = useUserQuoteReply(token);

  const quoteQuery = useQuery<QuoteRequestsResponse>({
    queryKey: ["my-quote-requests", user?.id ?? "current-user", page],
    queryFn: () => {
      if (!token) throw new Error("Please sign in to view your quote requests.");
      return fetchQuoteRequests(token, page);
    },
    enabled: Boolean(token),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const quotes = quoteQuery.data?.data ?? [];
  const total = quoteQuery.data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const isLoading =
    sessionStatus === "loading" || (Boolean(token) && quoteQuery.isPending);

  const openReplyModal = (quote: QuoteRequest) => {
    setReplyingQuote(quote);
    markAsRead(quote._id, quote.updatedAt);
    setReplySubject(`Reply to ${quote.businessOwnerName}`);
    setReplyDescription("");
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingQuote || !replySubject.trim() || !replyDescription.trim()) {
      toast.error("Please fill in both subject and message.");
      return;
    }

    replyMutation.mutate(
      {
        quoteId: replyingQuote._id,
        subject: replySubject.trim(),
        description: replyDescription.trim(),
      },
      {
        onSuccess: () => {
          markAsRead(replyingQuote._id, replyingQuote.updatedAt);
          setReplyingQuote(null);
          setReplySubject("");
          setReplyDescription("");
        },
      }
    );
  };

  const deleteQuoteMutation = useMutation<
    DeleteQuoteResponse,
    Error,
    string
  >({
    mutationKey: ["delete-my-quote-request"],
    mutationFn: async (quoteId) => {
      if (!token) throw new Error("Please sign in to delete this request.");
      const response = await fetch(
        `${getApiUrl()}/qoute/my/${encodeURIComponent(quoteId)}`,
        {
          method: "DELETE",
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = (await response.json()) as DeleteQuoteResponse;
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete this request.");
      }
      return result;
    },
    onSuccess: async (result) => {
      setSelectedQuote(null);
      setQuoteToDelete(null);
      if (quotes.length === 1 && page > 1) setPage((current) => current - 1);
      await queryClient.invalidateQueries({ queryKey: ["my-quote-requests"] });
      toast.success(result.message);
    },
    onError: (error) => toast.error(error.message),
  });

  const confirmDelete = (quote: QuoteRequest) => {
    setQuoteToDelete(quote);
  };

  return (
    <AccountPageShell active="request-quote" showProfileCard={false}>
      <>
        <AccountSectionHeader
          title="My Quotes"
          description="Track your service requests, review details, and monitor their status."
          count={!isLoading && token ? `${total} total` : undefined}
        />
        {isLoading ? (
          <div className="overflow-x-auto">
            <QuoteTableSkeleton />
          </div>
        ) : sessionStatus === "unauthenticated" || !token ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[8px] border border-[#E8ECF2] bg-white px-6 text-center">
            <AlertCircle className="h-9 w-9 text-[#667085]" />
            <h2 className="mt-3 text-[16px] font-bold text-[#292D73]">
              Sign in required
            </h2>
            <p className="mt-1 text-[12px] text-[#667085]">
              Please sign in to view your quote requests.
            </p>
            <Link
              href="/login"
              className="mt-5 inline-flex h-9 items-center rounded-[5px] bg-[#292D73] px-5 text-[12px] font-bold text-white"
            >
              Sign In
            </Link>
          </div>
        ) : quoteQuery.isError ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[8px] border border-red-200 bg-red-50 px-6 text-center">
            <AlertCircle className="h-9 w-9 text-red-500" />
            <h2 className="mt-3 text-[16px] font-bold text-red-900">
              Unable to load quote requests
            </h2>
            <p className="mt-1 max-w-md text-[12px] text-red-700">
              {quoteQuery.error instanceof Error
                ? quoteQuery.error.message
                : "Please try again."}
            </p>
            <button
              type="button"
              onClick={() => quoteQuery.refetch()}
              disabled={quoteQuery.isFetching}
              className="mt-5 h-9 rounded-[5px] bg-[#292D73] px-5 text-[12px] font-bold text-white disabled:opacity-60"
            >
              {quoteQuery.isFetching ? "Trying again..." : "Try Again"}
            </button>
          </div>
        ) : quotes.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[8px] border border-[#E8ECF2] bg-white px-6 text-center">
            <Inbox className="h-10 w-10 text-[#98A2B3]" />
            <h2 className="mt-3 text-[16px] font-bold text-[#292D73]">
              No quote requests
            </h2>
            <p className="mt-1 text-[12px] text-[#667085]">
              Your quote requests will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-[#e2e7ef] bg-white p-3 shadow-[0_10px_30px_rgba(32,42,70,0.06)] sm:p-0">
              <div>
                <div className="hidden grid-cols-[1fr_0.8fr_1.4fr_0.75fr_0.8fr] border-b border-[#e2e7ef] bg-[#f8fafc] text-center text-[11px] font-semibold uppercase tracking-wide text-[#667085] sm:grid">
                  <div className="px-4 py-3">Company</div>
                  <div className="px-4 py-3">Service</div>
                  <div className="px-4 py-3">Details</div>
                  <div className="px-4 py-3">Status</div>
                  <div className="px-4 py-3">Actions</div>
                </div>

                {quotes.map((quote) => {
                  const isReplied = quote.isReplied || quote.status === "responded";
                  const readKey = quote.updatedAt ? `${quote._id}_${quote.updatedAt}` : quote._id;
                  const isUnread = !readQuoteIds.includes(readKey);

                  return (
                    <div
                      key={quote._id}
                      className={`mb-3 grid gap-3 rounded-xl border border-[#e6eaf0] p-4 text-left text-[12px] font-medium text-[#667085] last:mb-0 sm:mb-0 sm:grid-cols-[1fr_0.8fr_1.4fr_0.75fr_0.8fr] sm:items-center sm:rounded-none sm:border-0 sm:border-b sm:border-[#e6eaf0] sm:p-0 sm:text-center sm:last:border-b-0 transition-colors ${
                        isUnread ? "bg-indigo-50/40 font-medium" : ""
                      }`}
                    >
                      <div className="px-4 py-5 font-semibold text-[#292D73]">
                        <span className="mb-1 block text-[10px] uppercase tracking-wide text-[#98A2B3] sm:hidden">
                          Company
                        </span>
                        {quote.businessOwnerName}
                      </div>

                      <div className="px-4 py-2 sm:py-5">
                        <span className="mb-1 block text-[10px] uppercase tracking-wide text-[#98A2B3] sm:hidden">
                          Service
                        </span>
                        {quote.serviceNeeded}
                      </div>

                      <div className="line-clamp-2 px-4 py-5 leading-relaxed">
                        <span className="mb-1 block text-[10px] uppercase tracking-wide text-[#98A2B3] sm:hidden">
                          Details
                        </span>
                        {quote.projectDetails}
                      </div>

                      {/* Status Column with Notification Dot */}
                      <div className="px-4 py-5 flex items-center justify-center">
                        <span className="mb-2 block text-[10px] uppercase tracking-wide text-[#98A2B3] sm:hidden">
                          Status
                        </span>
                        {isUnread ? (
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(quote)}
                            title="Click to view quote details"
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                              isReplied
                                ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
                                : "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                            }`}
                          >
                            <span className="relative flex h-2 w-2 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                            <span>{isReplied ? "New Reply" : "Submitted"}</span>
                          </button>
                        ) : isReplied ? (
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(quote)}
                            title="Click to view reply history"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 bg-indigo-100 text-indigo-800 border border-indigo-200 hover:bg-indigo-200"
                          >
                            <span>Replied</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 bg-amber-100 text-amber-800 border border-amber-200">
                            Pending
                          </span>
                        )}
                      </div>

                      {/* Actions Column */}
                      <div className="flex items-center gap-2 px-4 py-2 sm:justify-center sm:px-3 sm:py-5">
                        {/* Reply Button */}
                        <button
                          type="button"
                          onClick={() => openReplyModal(quote)}
                          className="inline-flex h-8 px-2.5 items-center justify-center gap-1 rounded-[4px] bg-[#292D73] text-white font-bold text-[11px] hover:bg-[#20255F] transition-colors shadow-sm whitespace-nowrap shrink-0"
                          title="Reply to quote"
                        >
                          <Reply className="h-3.5 w-3.5" />
                          <span>Reply</span>
                        </button>

                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(quote)}
                          className="relative inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#292D73] text-[#292D73] transition hover:bg-[#292D73] hover:text-white shrink-0"
                          aria-label={`View ${quote.businessOwnerName} quote details`}
                          title="View details and reply history"
                        >
                          <Eye className="h-4 w-4" />
                          {isUnread && (
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-600 rounded-full ring-2 ring-white animate-pulse" />
                          )}
                        </button>

                        {/* Delete Quote */}
                        <button
                          type="button"
                          onClick={() => confirmDelete(quote)}
                          disabled={
                            deleteQuoteMutation.isPending &&
                            deleteQuoteMutation.variables === quote._id
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-red-500 text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
                          aria-label={`Delete ${quote.businessOwnerName} quote request`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {totalPages > 1 && (
              <nav
                className="mt-6 flex items-center justify-center gap-3"
                aria-label="Quote requests pagination"
              >
                <button
                  type="button"
                  disabled={page === 1 || quoteQuery.isFetching}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="h-9 rounded-[4px] border border-[#B8C0CC] px-4 text-[12px] font-semibold text-[#475467] disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-[12px] font-medium text-[#667085]">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page === totalPages || quoteQuery.isFetching}
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  className="h-9 rounded-[4px] bg-[#292D73] px-4 text-[12px] font-semibold text-white disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}

        {/* VIEW DETAILS MODAL */}
        {selectedQuote && (
          <UserQuoteDetailsModal
            quote={selectedQuote}
            token={token}
            onClose={() => setSelectedQuote(null)}
            onOpenReply={() => {
              const q = selectedQuote;
              setSelectedQuote(null);
              openReplyModal(q);
            }}
          />
        )}

        {/* REPLY MODAL */}
        <Dialog open={Boolean(replyingQuote)} onOpenChange={(open) => !open && setReplyingQuote(null)}>
          <DialogContent className="max-h-[90vh] max-w-[550px] overflow-y-auto rounded-[16px] bg-white p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#292D73] flex items-center gap-2">
                <Reply className="w-5 h-5 text-indigo-600" />
                Reply to Quote Request
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Send a response regarding your quote with{" "}
                <span className="font-semibold text-slate-800">
                  {replyingQuote?.businessOwnerName}
                </span>
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
                  placeholder="Write your message here..."
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReplyingQuote(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replyMutation.isPending}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#292D73] hover:bg-[#20255F] rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-60 transition-colors"
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
          isOpen={Boolean(quoteToDelete)}
          onClose={() => {
            if (!deleteQuoteMutation.isPending) setQuoteToDelete(null);
          }}
          onConfirm={() => {
            if (quoteToDelete && !deleteQuoteMutation.isPending) {
              deleteQuoteMutation.mutate(quoteToDelete._id);
            }
          }}
          title="Delete quote request?"
          desc="Are you sure you want to delete this quote request? This action cannot be undone."
        />
      </>
    </AccountPageShell>
  );
};

function UserQuoteDetailsModal({
  quote,
  token,
  onClose,
  onOpenReply,
}: {
  quote: QuoteRequest;
  token?: string;
  onClose: () => void;
  onOpenReply: () => void;
}) {
  const { data: repliesResponse, isPending } = useQuoteReplies(
    quote._id,
    "user",
    token
  );
  const replies = repliesResponse?.data || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <article className="relative max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-[16px] bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded p-1 text-[#667085] hover:bg-[#F2F4F7]"
          aria-label="Close quote details"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="pr-8 text-xl font-bold text-[#292D73]">
          Quote Request Details
        </h2>

        <div className="space-y-4 pt-4">
          {/* Clean compact summary banner */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Company</span>
              <p className="text-sm font-bold text-slate-800">{quote.businessOwnerName}</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Service</span>
              <p className="text-sm font-bold text-indigo-600">{quote.serviceNeeded}</p>
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Project Details
            </p>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {quote.projectDetails}
            </p>
          </div>

          {/* REPLIES HISTORY SECTION */}
          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#292D73] flex items-center gap-1.5">
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
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {reply.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onOpenReply}
              className="h-9 rounded-lg bg-[#292D73] px-4 text-xs font-bold text-white hover:bg-[#20255F] flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Reply className="w-3.5 h-3.5" />
              <span>Reply to Quote</span>
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
      </article>
    </div>
  );
}

export default RequestQuoteContainer;
