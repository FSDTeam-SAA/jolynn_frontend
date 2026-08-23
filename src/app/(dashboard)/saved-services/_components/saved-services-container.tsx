"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useSavedBusinesses } from "@/hooks/use-saved-businesses";
import { Bookmark, ChevronLeft, ChevronRight, ImageIcon, MapPin, Search, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

const PAGE_LIMIT = 10;

const SavedServicesContainer = () => {
  const { data: session, status: sessionStatus } = useSession();
  const user = session?.user as { id?: string; token?: string; accessToken?: string } | undefined;
  const token = user?.accessToken ?? user?.token;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const savedBusinessesQuery = useSavedBusinesses(token, page, PAGE_LIMIT, user?.id);
  const businesses = useMemo(() => savedBusinessesQuery.data?.data ?? [], [savedBusinessesQuery.data?.data]);
  const filteredBusinesses = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return businesses;
    return businesses.filter(({ businessOwner }) => [businessOwner.businessName, businessOwner.category, businessOwner.service?.title, businessOwner.city, businessOwner.state].some((value) => value?.toLowerCase().includes(query)));
  }, [businesses, search]);
  const total = savedBusinessesQuery.data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const isLoading = sessionStatus === "loading" || (Boolean(token) && savedBusinessesQuery.isPending);

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-[428px]">
          <span className="sr-only">Search saved services on this page</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search saved services..." className="h-[38px] w-full rounded-[10px] border-0 bg-[#EAECED] pl-11 pr-4 text-sm text-[#344054] outline-none placeholder:text-[#667085] focus:ring-2 focus:ring-[#30347F]/20" />
        </label>
        <div className="flex h-[38px] items-center gap-2 rounded-[6px] bg-white px-4 text-sm font-medium text-[#344054]"><Bookmark className="h-4 w-4 text-[#30347F]" aria-hidden="true" /><span>{isLoading ? "Saved Services" : `${total} Saved Service${total === 1 ? "" : "s"}`}</span></div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-[208px] rounded-[7px]" />)}</div>
      ) : savedBusinessesQuery.isError || !token ? (
        <div className="rounded-[8px] bg-white px-6 py-14 text-center"><p className="text-sm text-red-600">{savedBusinessesQuery.error instanceof Error ? savedBusinessesQuery.error.message : "Please sign in to view your saved services."}</p>{token && <button type="button" onClick={() => savedBusinessesQuery.refetch()} className="mt-3 text-sm font-semibold text-[#30347F] hover:underline">Try again</button>}</div>
      ) : filteredBusinesses.length ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredBusinesses.map(({ id, businessOwner: business }) => {
            const location = [business.address, business.city, business.state].filter(Boolean).join(", ") || business.serviceArea;
            const rating = Number(business.rating) || 0;
            return (
              <article key={id} className="rounded-[7px] bg-white p-5">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F2F4F7]">{business.service?.logo?.url ? <Image src={business.service.logo.url} alt={`${business.businessName} logo`} fill sizes="48px" className="object-cover" /> : <ImageIcon className="h-5 w-5 text-[#98A2B3]" />}</div>
                  <div className="min-w-0 flex-1"><h2 className="truncate text-[18px] font-medium leading-6 text-[#171717]">{business.businessName}</h2><span className="mt-1 inline-flex rounded-full bg-[#F2F4F7] px-2 py-0.5 text-[10px] font-semibold text-[#667085]">{business.category || business.service?.title}</span></div>
                  <Bookmark className="h-5 w-5 shrink-0 fill-[#30347F] text-[#30347F]" aria-label="Saved" />
                </div>
                <div className="mt-3 flex items-center gap-1.5"><div className="flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>{Array.from({ length: 5 }).map((_, index) => <Star key={index} className={`h-3.5 w-3.5 ${index < Math.round(rating) ? "fill-[#FFB800] text-[#FFB800]" : "text-[#D0D5DD]"}`} />)}</div><span className="text-xs font-semibold text-[#344054]">{rating.toFixed(1)}</span><span className="text-xs text-[#667085]">({business.totalReviews ?? 0} reviews)</span></div>
                <div className="mt-3 flex items-start gap-1.5 text-[13px] leading-5 text-[#667085]"><MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span className="line-clamp-1">{location || "Location not provided"}</span></div>
                <p className="mt-2 line-clamp-2 min-h-10 text-[13px] leading-5 text-[#5F6368]">{business.service?.description || "No service description provided."}</p>
                <div className="mt-4 grid grid-cols-2 gap-2"><Link href={`/services/businesses/${business.businessOwnerId}`} className="flex h-9 items-center justify-center rounded-[5px] bg-[#30347F] px-3 text-xs font-medium text-white transition hover:bg-[#252966]">View Profile</Link><Link href={`/services/businesses/${business.businessOwnerId}?tab=reviews`} className="flex h-9 items-center justify-center rounded-[5px] border border-[#30347F] px-3 text-xs font-medium text-[#30347F] transition hover:bg-[#F3F4FA]">Write a Review</Link></div>
              </article>
            );
          })}
        </div>
      ) : <div className="rounded-[8px] bg-white px-6 py-14 text-center text-sm text-[#667085]">{search ? "No matching saved services found on this page." : "You haven’t saved any services yet."}</div>}

      {!isLoading && !savedBusinessesQuery.isError && totalPages > 1 && <div className="mt-6 flex items-center justify-between gap-4 rounded-[7px] bg-white px-4 py-3"><p className="text-xs text-[#667085]">Showing {(page - 1) * PAGE_LIMIT + 1}–{Math.min(page * PAGE_LIMIT, total)} of {total}</p><div className="flex items-center gap-2"><button type="button" aria-label="Previous page" disabled={page === 1 || savedBusinessesQuery.isFetching} onClick={() => setPage((current) => Math.max(1, current - 1))} className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D0D5DD] text-[#344054] disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span className="text-xs font-medium text-[#344054]">Page {page} of {totalPages}</span><button type="button" aria-label="Next page" disabled={page >= totalPages || savedBusinessesQuery.isFetching} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D0D5DD] text-[#344054] disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>}
    </section>
  );
};

export default SavedServicesContainer;
