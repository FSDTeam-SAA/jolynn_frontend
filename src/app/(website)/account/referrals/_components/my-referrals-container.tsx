"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ApiSuccess,
  MyReferral,
  PaginatedResponse,
  ReferralApiError,
  authHeaders,
  getReferralApiUrl,
  parseReferralResponse,
} from "@/lib/business-referrals";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Building2, Loader2, Mail, MapPin, Pencil, RotateCw, Search, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AccountPageShell, AccountSectionHeader } from "../../_components/account-ui";

const PAGE_LIMIT = 8;

const deliveryStyle = {
  pending: "bg-amber-50 text-amber-700",
  sent: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-700",
} as const;

export default function MyReferralsContainer() {
  const { data: session, status } = useSession();
  const sessionUser = session?.user as { id?: string; role?: string; token?: string; accessToken?: string } | undefined;
  const token = sessionUser?.accessToken ?? sessionUser?.token;
  const queryClient = useQueryClient();
  const router = useRouter();
  const isPersonalProfile = sessionUser?.role === "user";
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [claimStatus, setClaimStatus] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [editing, setEditing] = useState<MyReferral | null>(null);
  const [correctedEmail, setCorrectedEmail] = useState("");
  const [now, setNow] = useState(Date.now());
  const [cooldownUntil, setCooldownUntil] = useState<Record<string, number>>({});

  const handleActionError = (error: Error) => {
    if (error instanceof ReferralApiError && error.status === 401) {
      router.push("/login?callbackUrl=%2Faccount%2Freferrals");
      return;
    }
    toast.error(error instanceof ReferralApiError && error.status === 403
      ? "Switch to your personal profile to manage your referrals."
      : error.message);
  };

  const updateCachedReferral = (id: string, fields: Partial<MyReferral>) => {
    queryClient.setQueriesData<PaginatedResponse<MyReferral>>(
      { queryKey: ["my-business-referrals", sessionUser?.id] },
      (previous) => previous && ({ ...previous, data: previous.data.map((item) => item.id === id ? { ...item, ...fields } : item) }),
    );
  };

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => setPage(1), [search, claimStatus, emailStatus]);

  const queryKey = useMemo(
    () => ["my-business-referrals", sessionUser?.id, sessionUser?.role, page, search, claimStatus, emailStatus],
    [claimStatus, emailStatus, page, search, sessionUser?.id, sessionUser?.role],
  );
  const referralsQuery = useQuery({
    queryKey,
    enabled: Boolean(token) && isPersonalProfile,
    retry: false,
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_LIMIT), sortBy: "createdAt", sortOrder: "desc" });
      if (search.trim()) params.set("searchTerm", search.trim());
      if (claimStatus) params.set("claimStatus", claimStatus);
      if (emailStatus) params.set("emailDeliveryStatus", emailStatus);
      const response = await fetch(`${getReferralApiUrl()}/business-referrals/mine?${params}`, { headers: authHeaders(token) });
      return parseReferralResponse<PaginatedResponse<MyReferral>>(response);
    },
  });

  useEffect(() => {
    if (referralsQuery.error instanceof ReferralApiError && referralsQuery.error.status === 401) {
      router.replace("/login?callbackUrl=%2Faccount%2Freferrals");
    }
  }, [referralsQuery.error, router]);

  const resendMutation = useMutation({
    mutationFn: async (referral: MyReferral) => {
      const response = await fetch(`${getReferralApiUrl()}/business-referrals/${encodeURIComponent(referral.id)}/notifications/resend`, {
        method: "POST",
        headers: authHeaders(token),
      });
      return parseReferralResponse<ApiSuccess<Partial<MyReferral>>>(response);
    },
    onSuccess: async (response, referral) => {
      updateCachedReferral(referral.id, response.data);
      if (response.data.emailDeliveryStatus === "failed") toast.warning(response.message);
      else toast.success(response.message);
      await queryClient.invalidateQueries({ queryKey: ["my-business-referrals"] });
    },
    onError: (error, referral) => {
      if (error instanceof ReferralApiError && error.status === 429) {
        setCooldownUntil((current) => ({ ...current, [referral.id]: Date.now() + 60_000 }));
      }
      handleActionError(error);
      void queryClient.invalidateQueries({ queryKey: ["my-business-referrals"] });
    },
  });

  const correctionMutation = useMutation({
    mutationFn: async () => {
      if (!editing) throw new Error("Referral not selected.");
      const response = await fetch(`${getReferralApiUrl()}/business-referrals/${encodeURIComponent(editing.id)}/contact-email`, {
        method: "PATCH",
        headers: { ...authHeaders(token), "Content-Type": "application/json" },
        body: JSON.stringify({ businessEmail: correctedEmail.trim() }),
      });
      return parseReferralResponse<ApiSuccess<MyReferral>>(response);
    },
    onSuccess: async (response) => {
      updateCachedReferral(response.data.id, response.data);
      if (response.data.emailDeliveryStatus === "failed") toast.warning(response.message);
      else toast.success(response.message);
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ["my-business-referrals"] });
      await queryClient.invalidateQueries({ queryKey: ["business-search"] });
      await queryClient.invalidateQueries({ queryKey: ["business-referral-profile", response.data.slug] });
    },
    onError: handleActionError,
  });

  const referrals = referralsQuery.data?.data ?? [];
  const total = referralsQuery.data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const isLoading = status === "loading" || (Boolean(token) && isPersonalProfile && referralsQuery.isPending);
  const submitCorrection = (event: FormEvent) => {
    event.preventDefault();
    if (!correctedEmail.trim()) return toast.error("Enter a valid business email.");
    if (correctedEmail.trim().toLowerCase() === editing?.businessEmail.toLowerCase()) {
      return toast.error("Enter a different business email address.");
    }
    correctionMutation.mutate();
  };

  return (
    <AccountPageShell active="referrals" showProfileCard={false}>
      <AccountSectionHeader title="Reviews / Referrals" description="Track the businesses you referred and manage their private claim-email delivery." count={!isLoading ? `${total} total` : undefined} />

      <div className="mb-5 grid gap-3 rounded-xl border border-[#E6EAF0] bg-white p-4 md:grid-cols-[minmax(0,1fr)_190px_190px]">
        <label className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search referrals" className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-[#292D73]" /></label>
        <select value={claimStatus} onChange={(e) => setClaimStatus(e.target.value)} className="h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-700 outline-none"><option value="">All claim statuses</option><option value="unclaimed">Unclaimed</option><option value="claimed">Claimed</option></select>
        <select value={emailStatus} onChange={(e) => setEmailStatus(e.target.value)} className="h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-700 outline-none"><option value="">All email statuses</option><option value="pending">Pending</option><option value="sent">Sent</option><option value="failed">Failed</option></select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-64 animate-pulse rounded-xl bg-slate-100" />)}</div>
      ) : status !== "authenticated" || !token ? (
        <div className="rounded-xl border bg-white p-10 text-center"><p className="text-sm text-slate-600">Please sign in with your personal profile to view your referrals.</p><Link href="/login?callbackUrl=%2Faccount%2Freferrals" className="mt-4 inline-flex rounded-lg bg-[#292D73] px-5 py-2.5 text-sm font-bold text-white">Sign in</Link></div>
      ) : !isPersonalProfile ? (
        <div className="rounded-xl border bg-white p-10 text-center text-sm text-slate-600">Switch to your personal profile from the account menu to manage your referrals.</div>
      ) : referralsQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">{referralsQuery.error instanceof Error ? referralsQuery.error.message : "Unable to load referrals."}</div>
      ) : referrals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center"><Building2 className="mx-auto h-10 w-10 text-slate-300" /><h2 className="mt-3 font-bold text-[#171A3A]">No referrals found</h2><p className="mt-1 text-sm text-slate-500">Refer a local business from your profile to see it here.</p></div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {referrals.map((referral) => {
            const secondsSinceAttempt = referral.emailLastAttemptAt ? Math.floor((now - new Date(referral.emailLastAttemptAt).getTime()) / 1000) : 60;
            const cooldown = Math.max(0, 60 - secondsSinceAttempt, Math.ceil(((cooldownUntil[referral.id] ?? 0) - now) / 1000));
            const resendDisabled = referral.claimStatus === "claimed" || cooldown > 0 || resendMutation.isPending;
            const canManage = referral.claimStatus === "unclaimed" && referral.listingStatus === "published";
            return (
              <article key={referral.id} className="overflow-hidden rounded-xl border border-[#E6EAF0] bg-white shadow-sm">
                <div className="flex gap-4 p-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">{referral.image ? <Image src={referral.image} alt={referral.businessName} fill className="object-cover" sizes="96px" /> : <Building2 className="m-7 h-10 w-10 text-slate-300" />}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2"><div><Link href={referral.profileUrl} className="line-clamp-1 font-extrabold text-[#171A3A] hover:underline">{referral.businessName}</Link><p className="mt-1 text-xs text-slate-500">{referral.category}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${referral.claimStatus === "claimed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{referral.claimStatus}</span></div>
                    <p className="mt-2 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" />{referral.city}, {referral.state}</p>
                    <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-slate-700"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{referral.rating.toFixed(1)}</p>
                  </div>
                </div>
                <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2"><p className="flex min-w-0 items-center gap-1.5 truncate text-xs text-slate-600"><Mail className="h-3.5 w-3.5" />{referral.businessEmail}</p><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${deliveryStyle[referral.emailDeliveryStatus]}`}>Email {referral.emailDeliveryStatus}</span></div>
                  <p className="mt-2 text-[11px] text-slate-500">Delivery attempts: {referral.emailDeliveryAttempts}{referral.emailLastAttemptAt ? ` · Last attempt: ${new Date(referral.emailLastAttemptAt).toLocaleString()}` : ""}</p>
                  {canManage ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" disabled={resendDisabled || correctionMutation.isPending} onClick={() => resendMutation.mutate(referral)} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#292D73] px-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
                        {resendMutation.isPending && resendMutation.variables?.id === referral.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCw className="h-3.5 w-3.5" />}
                        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend claim email"}
                      </button>
                      <button type="button" disabled={resendMutation.isPending || correctionMutation.isPending} onClick={() => { setEditing(referral); setCorrectedEmail(referral.businessEmail); }} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 text-xs font-bold text-slate-700 disabled:opacity-50"><Pencil className="h-3.5 w-3.5" />Correct email</button>
                    </div>
                  ) : <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-600"><BadgeCheck className="h-4 w-4" />{referral.claimStatus === "claimed" ? "This business has been claimed." : "This referral is no longer published."}</p>}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {totalPages > 1 ? <div className="mt-6 flex items-center justify-center gap-3"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-4 py-2 text-xs font-bold disabled:opacity-40">Previous</button><span className="text-xs text-slate-600">Page {page} of {totalPages}</span><button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-4 py-2 text-xs font-bold disabled:opacity-40">Next</button></div> : null}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Correct business email</DialogTitle><DialogDescription>This invalidates the old private claim link and sends a new link to the corrected address.</DialogDescription></DialogHeader><form onSubmit={submitCorrection} className="mt-3 grid gap-4"><label className="grid gap-1.5 text-sm font-semibold text-slate-700">Business email<input type="email" required value={correctedEmail} onChange={(e) => setCorrectedEmail(e.target.value)} className="h-11 rounded-lg border border-slate-300 px-3 outline-none focus:border-[#292D73]" /></label><button type="submit" disabled={correctionMutation.isPending} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#292D73] text-sm font-bold text-white disabled:opacity-50">{correctionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Save and send new link</button></form></DialogContent>
      </Dialog>
    </AccountPageShell>
  );
}
