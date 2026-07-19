"use client";

import { Skeleton } from "@/components/ui/skeleton";
import DeleteModal from "@/components/modals/delete-modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Eye, Inbox, Trash2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { AccountPageShell } from "../../_components/account-ui";

type QuoteStatus = "pending" | "accepted" | "rejected" | "completed";

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

const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("The quote API is not configured.");
  return apiUrl;
};

const fetchQuoteRequests = async (
  token: string,
  page: number,
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
    <div className="grid min-w-[900px] grid-cols-[1fr_0.8fr_1.5fr_0.55fr_0.75fr] border-b border-[#D9DEE7] px-4 py-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="mx-auto h-4 w-20" />
      ))}
    </div>
    {Array.from({ length: 5 }).map((_, rowIndex) => (
      <div
        key={rowIndex}
        className="grid min-w-[900px] grid-cols-[1fr_0.8fr_1.5fr_0.55fr_0.75fr] items-center gap-4 border-b border-[#E8ECF2] px-4 py-5 last:border-b-0"
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
  const [quoteToDelete, setQuoteToDelete] = useState<QuoteRequest | null>(null);

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
        },
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
          <div className="overflow-x-auto rounded-[8px] border border-[#9BA3AF] bg-white">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[1fr_0.8fr_1.5fr_0.55fr_0.75fr] border-b border-[#9BA3AF] bg-white text-center text-[11px] font-medium text-[#667085]">
                <div className="px-4 py-3">Company</div>
                <div className="px-4 py-3">Service</div>
                <div className="px-4 py-3">Details</div>
                <div className="px-4 py-3">Status</div>
                <div className="px-4 py-3">Actions</div>
              </div>

              {quotes.map((quote) => (
                <div
                  key={quote._id}
                  className="grid grid-cols-[1fr_0.8fr_1.5fr_0.55fr_0.75fr] items-center border-b border-[#9BA3AF] text-center text-[12px] font-medium text-[#667085] last:border-b-0"
                >
                  <div className="px-4 py-5 font-semibold text-[#292D73]">
                    {quote.businessOwnerName}
                  </div>
                  <div className="px-4 py-5">{quote.serviceNeeded}</div>
                  <div className="line-clamp-2 px-4 py-5 leading-relaxed">
                    {quote.projectDetails}
                  </div>
                  <div className="px-4 py-5">
                    <span className="inline-flex rounded-full bg-[#FFF3CD] px-3 py-1 text-[10px] font-bold capitalize text-[#9A6700]">
                      {quote.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 px-3 py-5 ">
                    <button
                      type="button"
                      onClick={() => setSelectedQuote(quote)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#292D73] text-[#292D73] transition hover:bg-[#292D73] hover:text-white"
                      aria-label={`View ${quote.businessOwnerName} quote details`}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDelete(quote)}
                      disabled={
                        deleteQuoteMutation.isPending &&
                        deleteQuoteMutation.variables === quote._id
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-red-500 text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`Delete ${quote.businessOwnerName} quote request`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
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
      {selectedQuote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quote-details-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedQuote(null);
          }}
        >
          <article className="relative max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-[12px] bg-white p-5 shadow-2xl sm:p-7">
            <button
              type="button"
              onClick={() => setSelectedQuote(null)}
              className="absolute right-4 top-4 rounded p-1 text-[#667085] hover:bg-[#F2F4F7]"
              aria-label="Close quote details"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 id="quote-details-title" className="pr-8 text-[22px] font-extrabold text-[#292D73]">
              Quote Request Details
            </h2>
            <div className="mt-6 grid gap-4 text-[13px] sm:grid-cols-2">
              {[
                ["Company", selectedQuote.businessOwnerName],
                ["Service", selectedQuote.serviceNeeded],
                ["Name", selectedQuote.name],
                ["Email", selectedQuote.email],
                ["Phone", selectedQuote.phoneNumber],
                ["Status", selectedQuote.status],
                ["Requested", new Date(selectedQuote.createdAt).toLocaleString()],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#98A2B3]">{label}</p>
                  <p className="mt-1 break-words font-medium text-[#344054]">{value || "—"}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-[7px] bg-[#F8FAFC] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#98A2B3]">Project Details</p>
              <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-[#344054]">{selectedQuote.projectDetails}</p>
            </div>
          </article>
        </div>
      )}
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

export default RequestQuoteContainer;
