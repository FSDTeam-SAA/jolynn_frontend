"use client";

import { useSavedBusinesses } from "@/hooks/use-saved-businesses";
import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  AccountPageShell,
  SavedBusinessGrid,
} from "../../_components/account-ui";

const SaveServicesContainer = () => {
  const { data: session, status } = useSession();
  const user = session?.user as
    | { id?: string; token?: string; accessToken?: string }
    | undefined;
  const [page, setPage] = useState(1);
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
      {status === "loading" || isLoading ? (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2" aria-label="Loading saved services">
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
          <SavedBusinessGrid businesses={data.data} />
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
