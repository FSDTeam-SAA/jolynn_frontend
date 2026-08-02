"use client";

import DeleteModal from "@/components/modals/delete-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Eye, Inbox, Trash2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { AccountPageShell, AccountSectionHeader } from "../../_components/account-ui";

type HelpWantedPost = {
  _id: string;
  userId?: string;
  username: string;
  email: string;
  zipcode: string;
  category: string;
  phone: string;
  message: string;
  createdAt: string;
  updatedAt: string;
};

type HelpWantedResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  meta: { page: number; limit: number; total: number };
  data: HelpWantedPost[];
};

type DeleteHelpWantedResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: HelpWantedPost;
};

const PAGE_LIMIT = 10;

const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("The help wanted API is not configured.");
  return apiUrl;
};

const fetchMyHelpWanted = async (
  token: string,
  page: number,
): Promise<HelpWantedResponse> => {
  const params = new URLSearchParams({
    limit: String(PAGE_LIMIT),
    page: String(page),
  });
  const response = await fetch(`${getApiUrl()}/help-wanted/my?${params}`, {
    headers: {
      Accept: "*/*",
      Authorization: `Bearer ${token}`,
    },
  });
  const result = (await response.json()) as HelpWantedResponse;

  if (!response.ok || !result.success || !Array.isArray(result.data)) {
    throw new Error(result.message || "Unable to load your help wanted posts.");
  }
  return result;
};

const HelpWantedTableSkeleton = () => (
  <div className="overflow-hidden rounded-[8px] border border-[#D9DEE7] bg-white">
    <div className="grid min-w-[850px] grid-cols-[1fr_0.8fr_1.6fr_0.8fr_0.65fr] gap-4 border-b border-[#D9DEE7] px-4 py-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="mx-auto h-4 w-20" />
      ))}
    </div>
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className="grid min-w-[850px] grid-cols-[1fr_0.8fr_1.6fr_0.8fr_0.65fr] items-center gap-4 border-b border-[#E8ECF2] px-4 py-5 last:border-0"
      >
        <Skeleton className="mx-auto h-4 w-28" />
        <Skeleton className="mx-auto h-4 w-20" />
        <Skeleton className="mx-auto h-9 w-full max-w-[260px]" />
        <Skeleton className="mx-auto h-4 w-20" />
        <Skeleton className="mx-auto h-8 w-20" />
      </div>
    ))}
  </div>
);

const HelpWantedContainer = () => {
  const queryClient = useQueryClient();
  const { data: session, status: sessionStatus } = useSession();
  const user = session?.user as
    | { id?: string; token?: string; accessToken?: string }
    | undefined;
  const token = user?.accessToken ?? user?.token;
  const [page, setPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<HelpWantedPost | null>(null);
  const [postToDelete, setPostToDelete] = useState<HelpWantedPost | null>(null);

  const postsQuery = useQuery<HelpWantedResponse>({
    queryKey: ["my-help-wanted", user?.id ?? "current-user", page],
    queryFn: () => {
      if (!token) throw new Error("Please sign in to view your posts.");
      return fetchMyHelpWanted(token, page);
    },
    enabled: Boolean(token),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const posts = postsQuery.data?.data ?? [];
  const total = postsQuery.data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const isLoading =
    sessionStatus === "loading" || (Boolean(token) && postsQuery.isPending);

  const deleteMutation = useMutation<
    DeleteHelpWantedResponse,
    Error,
    HelpWantedPost
  >({
    mutationKey: ["delete-my-help-wanted"],
    mutationFn: async (post) => {
      if (!token) throw new Error("Please sign in to delete this post.");
      const response = await fetch(
        `${getApiUrl()}/help-wanted/${encodeURIComponent(post._id)}`,
        {
          method: "DELETE",
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = (await response.json()) as DeleteHelpWantedResponse;
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete this post.");
      }
      return result;
    },
    onSuccess: async (result) => {
      setSelectedPost(null);
      setPostToDelete(null);
      if (posts.length === 1 && page > 1) setPage((current) => current - 1);
      await queryClient.invalidateQueries({ queryKey: ["my-help-wanted"] });
      await queryClient.invalidateQueries({ queryKey: ["help-wanted"] });
      toast.success(result.message || "Help wanted post deleted successfully.");
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <AccountPageShell active="help-wanted" showProfileCard={false}>
      <>
        <AccountSectionHeader
          title="Help Wanted"
          description="Manage the help requests you have posted and review their details."
          count={!isLoading && token ? `${total} posts` : undefined}
          action={
            <Link href="/job-posts/create" className="inline-flex h-10 items-center justify-center rounded-xl bg-[#292D73] px-4 text-[12px] font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#20255F]">
              Post a request
            </Link>
          }
        />
        {isLoading ? (
          <div className="overflow-x-auto">
            <HelpWantedTableSkeleton />
          </div>
        ) : sessionStatus === "unauthenticated" || !token ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[8px] border border-[#E8ECF2] bg-white px-6 text-center">
            <AlertCircle className="h-9 w-9 text-[#667085]" />
            <h2 className="mt-3 text-[16px] font-bold text-[#292D73]">Sign in required</h2>
            <p className="mt-1 text-[12px] text-[#667085]">Please sign in to view your help wanted posts.</p>
            <Link href="/login" className="mt-5 inline-flex h-9 items-center rounded-[5px] bg-[#292D73] px-5 text-[12px] font-bold text-white">
              Sign In
            </Link>
          </div>
        ) : postsQuery.isError ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[8px] border border-red-200 bg-red-50 px-6 text-center">
            <AlertCircle className="h-9 w-9 text-red-500" />
            <h2 className="mt-3 text-[16px] font-bold text-red-900">Unable to load help wanted posts</h2>
            <p className="mt-1 max-w-md text-[12px] text-red-700">
              {postsQuery.error instanceof Error ? postsQuery.error.message : "Please try again."}
            </p>
            <button type="button" onClick={() => postsQuery.refetch()} disabled={postsQuery.isFetching} className="mt-5 h-9 rounded-[5px] bg-[#292D73] px-5 text-[12px] font-bold text-white disabled:opacity-60">
              {postsQuery.isFetching ? "Trying again..." : "Try Again"}
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[8px] border border-[#E8ECF2] bg-white px-6 text-center">
            <Inbox className="h-10 w-10 text-[#98A2B3]" />
            <h2 className="mt-3 text-[16px] font-bold text-[#292D73]">No help wanted posts</h2>
            <p className="mt-1 text-[12px] text-[#667085]">Your help wanted posts will appear here.</p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-[#e2e7ef] bg-white p-3 shadow-[0_10px_30px_rgba(32,42,70,0.06)] sm:p-0">
              <div>
                <div className="hidden grid-cols-[1fr_0.8fr_1.6fr_0.8fr_0.65fr] border-b border-[#e2e7ef] bg-[#f8fafc] text-center text-[11px] font-semibold uppercase tracking-wide text-[#667085] sm:grid">
                  <div className="px-4 py-3">Name</div>
                  <div className="px-4 py-3">Category</div>
                  <div className="px-4 py-3">Message</div>
                  <div className="px-4 py-3">Posted</div>
                  <div className="px-4 py-3">Actions</div>
                </div>
                {posts.map((post) => (
                  <div key={post._id} className="mb-3 grid gap-3 rounded-xl border border-[#e6eaf0] p-4 text-left text-[12px] font-medium text-[#667085] last:mb-0 sm:mb-0 sm:grid-cols-[1fr_0.8fr_1.6fr_0.8fr_0.65fr] sm:items-center sm:rounded-none sm:border-0 sm:border-b sm:border-[#e6eaf0] sm:p-0 sm:text-center sm:last:border-b-0">
                    <div className="break-words px-4 py-2 font-semibold text-[#292D73] sm:py-5"><span className="mb-1 block text-[10px] uppercase tracking-wide text-[#98A2B3] sm:hidden">Name</span>{post.username}</div>
                    <div className="break-words px-4 py-2 sm:py-5"><span className="mb-1 block text-[10px] uppercase tracking-wide text-[#98A2B3] sm:hidden">Category</span>{post.category}</div>
                    <div className="line-clamp-2 px-4 py-2 leading-relaxed sm:py-5"><span className="mb-1 block text-[10px] uppercase tracking-wide text-[#98A2B3] sm:hidden">Message</span>{post.message}</div>
                    <div className="px-4 py-2 sm:py-5"><span className="mb-1 block text-[10px] uppercase tracking-wide text-[#98A2B3] sm:hidden">Posted</span>{new Date(post.createdAt).toLocaleDateString()}</div>
                    <div className="flex items-center gap-2 px-4 py-2 sm:justify-center sm:px-3 sm:py-5">
                      <button type="button" onClick={() => setSelectedPost(post)} className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#292D73] text-[#292D73] transition hover:bg-[#292D73] hover:text-white" aria-label={`View ${post.username} post details`}>
                        <Eye className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => setPostToDelete(post)} disabled={deleteMutation.isPending} className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-red-500 text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50" aria-label={`Delete ${post.username} help wanted post`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {totalPages > 1 && (
              <nav className="mt-6 flex items-center justify-center gap-3" aria-label="Help wanted pagination">
                <button type="button" disabled={page === 1 || postsQuery.isFetching} onClick={() => setPage((current) => Math.max(1, current - 1))} className="h-9 rounded-[4px] border border-[#B8C0CC] px-4 text-[12px] font-semibold text-[#475467] disabled:opacity-50">Previous</button>
                <span className="text-[12px] font-medium text-[#667085]">Page {page} of {totalPages}</span>
                <button type="button" disabled={page === totalPages || postsQuery.isFetching} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="h-9 rounded-[4px] bg-[#292D73] px-4 text-[12px] font-semibold text-white disabled:opacity-50">Next</button>
              </nav>
            )}
          </>
        )}

        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4" role="dialog" aria-modal="true" aria-labelledby="help-wanted-details-title" onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedPost(null);
          }}>
            <article className="relative max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-[12px] bg-white p-5 shadow-2xl sm:p-7">
              <button type="button" onClick={() => setSelectedPost(null)} className="absolute right-4 top-4 rounded p-1 text-[#667085] hover:bg-[#F2F4F7]" aria-label="Close help wanted details">
                <X className="h-5 w-5" />
              </button>
              <h2 id="help-wanted-details-title" className="pr-8 text-[22px] font-extrabold text-[#292D73]">Help Wanted Details</h2>
              <div className="mt-6 grid gap-4 text-[13px] sm:grid-cols-2">
                {[
                  ["Name", selectedPost.username],
                  ["Email", selectedPost.email],
                  ["Phone", selectedPost.phone],
                  ["Zip Code", selectedPost.zipcode],
                  ["Category", selectedPost.category],
                  ["Posted", new Date(selectedPost.createdAt).toLocaleString()],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#98A2B3]">{label}</p>
                    <p className="mt-1 break-words font-medium text-[#344054]">{value || "—"}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-[7px] bg-[#F8FAFC] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#98A2B3]">Message</p>
                <p className="mt-2 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-[#344054]">{selectedPost.message}</p>
              </div>
            </article>
          </div>
        )}

        <DeleteModal
          isOpen={Boolean(postToDelete)}
          onClose={() => {
            if (!deleteMutation.isPending) setPostToDelete(null);
          }}
          onConfirm={() => {
            if (postToDelete && !deleteMutation.isPending) deleteMutation.mutate(postToDelete);
          }}
          title="Delete help wanted post?"
          desc="Are you sure you want to delete this help wanted post? This action cannot be undone."
        />
      </>
    </AccountPageShell>
  );
};

export default HelpWantedContainer;
