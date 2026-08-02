"use client";

import { useSavedBusinesses } from "@/hooks/use-saved-businesses";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import {
  AccountPageShell,
  AccountSectionHeader,
  SavedBusinessGrid,
} from "../../_components/account-ui";

const SaveServicesContainer = () => {
  const { data: session, status } = useSession();
  const user = session?.user as
    | { id?: string; token?: string; accessToken?: string }
    | undefined;
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const limit = 10;
  const { data, isLoading, isFetching, error, refetch } = useSavedBusinesses(
    user?.accessToken ?? user?.token,
    page,
    limit,
    user?.id,
  );
  const totalPages = Math.max(1, Math.ceil((data?.meta.total ?? 0) / limit));

  return (
    <AccountPageShell active="save-services" showProfileCard={false}>
      <AccountSectionHeader
        title="Saved Services"
        description="Quickly revisit the professionals and services you have saved."
        count={!isLoading && data ? `${data.meta.total} saved` : undefined}
      />
      {status === "loading" || isLoading ? (
        <div
          className={`grid grid-cols-1 gap-5 ${
            viewMode === "grid" ? "xl:grid-cols-2" : ""
          }`}
          aria-label="Loading saved services"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-[210px] animate-pulse rounded-[8px] bg-[#F2F4F7]" />
          ))}
        </div>
      ) : error ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[8px] border border-[#E8ECF2] bg-white px-6 text-center">
          <p className="text-[13px] font-semibold text-[#E11D48]">{error.message}</p>
          <button type="button" onClick={() => refetch()} className="mt-4 h-9 rounded-[4px] bg-[#292D73] px-4 text-[12px] font-bold text-white">Try Again</button>
        </div>
      ) : !data?.data.length ? (
        <div className="flex min-h-[260px] items-center justify-center rounded-[8px] border border-[#E8ECF2] bg-white px-6 text-center text-[13px] font-medium text-[#667085]">
          You haven&apos;t saved any services yet.
        </div>
      ) : (
        <>
          <div className="mb-5 flex justify-end">
            <div
              className="inline-flex items-center rounded-[7px] border border-[#D8DEE8] bg-[#F5F7FA] p-1"
              role="group"
              aria-label="Choose saved services view"
            >
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-pressed={viewMode === "list"}
                title="List view"
                className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-[5px] px-2.5 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73]/40 sm:px-3 ${
                  viewMode === "list"
                    ? "bg-[#292D73] text-white shadow-sm"
                    : "text-[#667085] hover:bg-white hover:text-[#292D73]"
                }`}
              >
                <List className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-pressed={viewMode === "grid"}
                title="Grid view"
                className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-[5px] px-2.5 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73]/40 sm:px-3 ${
                  viewMode === "grid"
                    ? "bg-[#292D73] text-white shadow-sm"
                    : "text-[#667085] hover:bg-white hover:text-[#292D73]"
                }`}
              >
                <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>
          </div>

          <SavedBusinessGrid businesses={data.data} viewMode={viewMode} />
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button type="button" disabled={page === 1 || isFetching} onClick={() => setPage((current) => current - 1)} className="h-9 rounded-[4px] border border-[#B8C0CC] px-4 text-[12px] font-semibold text-[#475467] disabled:opacity-50">Previous</button>
              <span className="text-[12px] font-medium text-[#667085]">Page {page} of {totalPages}</span>
              <button type="button" disabled={page === totalPages || isFetching} onClick={() => setPage((current) => current + 1)} className="h-9 rounded-[4px] bg-[#292D73] px-4 text-[12px] font-semibold text-white disabled:opacity-50">Next</button>
            </div>
          )}
        </>
      )}
    </AccountPageShell>
  );
};

export default SaveServicesContainer;
