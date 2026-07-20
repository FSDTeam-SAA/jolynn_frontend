"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

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
  status: "pending" | "accepted" | "rejected" | "completed";
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

const PAGE_LIMIT = 10;

const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
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
  const [page, setPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);

  const quoteQuery = useQuery<QuoteRequestsResponse>({
    queryKey: ["business-quote-requests", "pending", page],
    queryFn: async () => {
      if (!token) throw new Error("Please sign in to view quote requests.");
      const params = new URLSearchParams({ sortBy: "createdAt", limit: String(PAGE_LIMIT), page: String(page), status: "pending" });
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

  return (
    <section className="overflow-hidden rounded-[10px] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse text-left">
          <thead>
            <tr className="h-[48px] border-b border-[#EAECF0] text-[12px] font-medium text-[#526174]">
              <th className="w-[15%] px-5 text-center font-medium">Name</th>
              <th className="w-[16%] px-3 text-center font-medium">Email Address</th>
              <th className="w-[14%] px-3 text-center font-medium">Phone Number</th>
              <th className="w-[13%] px-3 text-center font-medium">Date &amp; time</th>
              <th className="w-[15%] px-3 text-center font-medium">Service</th>
              <th className="w-[21%] px-3 text-center font-medium">Details</th>
              <th className="w-[6%] px-3 text-center font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? Array.from({ length: 6 }).map((_, rowIndex) => (
              <tr key={rowIndex} className="h-[85px] border-b border-[#EAECF0]">{Array.from({ length: 7 }).map((__, cellIndex) => <td key={cellIndex} className="px-3"><Skeleton className="mx-auto h-4 w-24" /></td>)}</tr>
            )) : quoteRequests.map((request) => {
              const createdAt = formatDateTime(request.createdAt);
              return (
                <tr key={request._id} className="h-[85px] border-b border-[#EAECF0] text-[12px] text-[#66758A] last:border-b-0">
                  <td className="px-5 text-center">{request.name}</td>
                  <td className="px-3 text-center">{request.email}</td>
                  <td className="whitespace-nowrap px-3 text-center">{request.phoneNumber}</td>
                  <td className="px-3 text-center leading-[18px]"><span className="block">{createdAt.date}</span><span className="block text-[#98A2B3]">{createdAt.time}</span></td>
                  <td className="px-3 text-center">{request.serviceNeeded}</td>
                  <td className="max-w-[260px] truncate px-5 text-center leading-[17px]">{request.projectDetails}</td>
                  <td className="px-3 text-center">
                    <button type="button" aria-label={`View quote request from ${request.name}`} onClick={() => setSelectedRequest(request)} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF2FF] text-[#30347F] transition-colors hover:bg-[#DDE4FF]"><Eye className="h-[17px] w-[17px]" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!isLoading && (quoteQuery.isError || !token) && <div className="px-6 py-14 text-center"><p className="text-sm text-red-600">{quoteQuery.error instanceof Error ? quoteQuery.error.message : "Please sign in to view quote requests."}</p>{token && <button type="button" onClick={() => quoteQuery.refetch()} className="mt-3 text-sm font-semibold text-[#30347F] hover:underline">Try again</button>}</div>}
      {!isLoading && !quoteQuery.isError && token && quoteRequests.length === 0 && <div className="px-6 py-14 text-center text-sm text-[#667085]">No pending quote requests found.</div>}

      {!isLoading && !quoteQuery.isError && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#EAECF0] px-5 py-3">
          <p className="text-xs text-[#667085]">Showing {(page - 1) * PAGE_LIMIT + 1}–{Math.min(page * PAGE_LIMIT, total)} of {total}</p>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Previous page" disabled={page === 1 || quoteQuery.isFetching} onClick={() => setPage((current) => Math.max(1, current - 1))} className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D0D5DD] disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
            <span className="text-xs font-medium text-[#344054]">Page {page} of {totalPages}</span>
            <button type="button" aria-label="Next page" disabled={page >= totalPages || quoteQuery.isFetching} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D0D5DD] disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      <Dialog open={Boolean(selectedRequest)} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-h-[90vh] max-w-[620px] overflow-y-auto rounded-[12px] bg-white p-0">
          <DialogHeader className="border-b border-[#EAECF0] px-6 py-5 text-left">
            <DialogTitle className="text-xl font-semibold text-[#263B4A]">Quote Request Details</DialogTitle>
            <DialogDescription>Complete information submitted by the customer.</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
              <Detail label="Customer Name" value={selectedRequest.name} />
              <Detail label="Status" value={selectedRequest.status} capitalize />
              <Detail label="Email Address" value={selectedRequest.email} />
              <Detail label="Phone Number" value={selectedRequest.phoneNumber} />
              <Detail label="Service Needed" value={selectedRequest.serviceNeeded} />
              <Detail label="Requested At" value={`${formatDateTime(selectedRequest.createdAt).date}, ${formatDateTime(selectedRequest.createdAt).time}`} />
              <div className="sm:col-span-2"><Detail label="Project Details" value={selectedRequest.projectDetails} /></div>
              <div className="sm:col-span-2 flex justify-end border-t border-[#EAECF0] pt-4"><button type="button" onClick={() => setSelectedRequest(null)} className="h-9 rounded-md bg-[#30347F] px-5 text-xs font-medium text-white hover:bg-[#252966]">Close</button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Detail({ label, value, capitalize = false }: { label: string; value?: string; capitalize?: boolean }) {
  return <div><p className="text-xs font-medium text-[#667085]">{label}</p><p className={`mt-1 break-words text-sm leading-6 text-[#202124] ${capitalize ? "capitalize" : ""}`}>{value || "—"}</p></div>;
}

export default QuateRequest;
