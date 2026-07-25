"use client";

import { Skeleton } from "@/components/ui/skeleton";
import DeleteModal from "@/components/modals/delete-modal";
import { useProfileQuery } from "@/hooks/APicalling";
import { normalizePublicUsername } from "@/lib/public-username";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  BriefcaseBusiness,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Flag,
  LayoutGrid,
  List,
  Mail,
  MapPin,
  PlusCircle,
  UserRound,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

type HelpWantedPost = {
  _id: string;
  userId?:
    | string
    | {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        username?: string;
        phoneNumber?: string;
        profilePicture?: string;
      };
  username: string;
  email: string;
  zipcode: string;
  category: string;
  profilePicture: string;
  phone: string;
  message: string;
  createdAt: string;
  updatedAt: string;
};

type HelpWantedResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: HelpWantedPost[];
};

type JobReportResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    _id: string;
    helpWantedId: string;
    userId: string;
    message: string;
    createdAt: string;
    updatedAt: string;
  };
};

type DeleteHelpWantedResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: HelpWantedPost;
};

const PAGE_LIMIT = 10;
type ViewMode = "grid" | "list";

const getPostUserId = (post: HelpWantedPost) =>
  typeof post.userId === "string" ? post.userId : post.userId?._id;

const fetchJobPosts = async (page: number): Promise<HelpWantedResponse> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("The help wanted service is not configured.");

  const params = new URLSearchParams({
    sortBy: "createdAt",
    limit: String(PAGE_LIMIT),
    page: String(page),
  });
  const response = await fetch(`${apiUrl}/help-wanted?${params}`, {
    headers: { Accept: "*/*" },
  });
  const result = (await response.json()) as HelpWantedResponse;

  if (!response.ok || !result.success || !Array.isArray(result.data)) {
    throw new Error(result.message || "Unable to load job posts.");
  }

  return result;
};

const JobPostsSkeleton = () => (
  <div className="space-y-5" aria-label="Loading job posts">
    {Array.from({ length: 3 }).map((_, index) => (
      <div
        key={index}
        className="rounded-[8px] border border-[#D4F0F1] bg-[#F0FEFE] p-5"
      >
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>
        </div>
        <Skeleton className="mt-5 h-px w-full" />
        <Skeleton className="mt-5 h-4 w-64" />
        <Skeleton className="mt-4 h-14 w-4/5" />
      </div>
    ))}
  </div>
);

const JobPostsContainer = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const sessionUser = session?.user as
    | {
        id?: string;
        email?: string | null;
        token?: string;
        accessToken?: string;
        role?: string;
      }
    | undefined;


  const token = sessionUser?.accessToken ?? sessionUser?.token;
  const { data: profileResponse } = useProfileQuery(token);
  const profile = profileResponse?.data;
  const currentUserId = profile?._id ?? sessionUser?.id;
  const currentUserEmail = (profile?.email ?? sessionUser?.email)
    ?.trim()
    .toLowerCase();

  const isOwnPost = (post: HelpWantedPost) => {
    const postUserId = getPostUserId(post);
    const populatedUserEmail =
      typeof post.userId === "object" ? post.userId.email : undefined;
    const postEmails = [post.email, populatedUserEmail]
      .filter(Boolean)
      .map((email) => email!.trim().toLowerCase());

    return Boolean(
      (currentUserId && postUserId === currentUserId) ||
        (currentUserEmail && postEmails.includes(currentUserEmail)),
    );
  };


  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [postToView, setPostToView] = useState<HelpWantedPost | null>(null);
  const [postToDelete, setPostToDelete] = useState<HelpWantedPost | null>(null);
  const [reportMessage, setReportMessage] = useState("");
  const jobPostsQuery = useQuery<HelpWantedResponse>({
    queryKey: ["help-wanted", page, PAGE_LIMIT],
    queryFn: () => fetchJobPosts(page),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const posts = jobPostsQuery.data?.data ?? [];
  const total = jobPostsQuery.data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const selectedReportPost = posts.find(
    (post) => post._id === selectedPostId,
  );
  const selectedReportUsername = selectedReportPost
    ? typeof selectedReportPost.userId === "object"
      ? selectedReportPost.userId.username || selectedReportPost.username
      : selectedReportPost.username
    : "";
  const viewedPostUser =
    postToView && typeof postToView.userId === "object"
      ? postToView.userId
      : undefined;
  const viewedPostUsername = postToView
    ? normalizePublicUsername(
        viewedPostUser?.username || postToView.username,
      )
    : "";
  const viewedPostProfileImage =
    postToView?.profilePicture || viewedPostUser?.profilePicture;

  const reportMutation = useMutation<
    JobReportResponse,
    Error,
    { helpWantedId: string; message: string }
  >({
    mutationKey: ["create-job-report"],
    mutationFn: async (payload) => {
      if (!token) throw new Error("Please sign in to report this post.");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error("The job report service is not configured.");

      const response = await fetch(`${apiUrl}/job-report`, {
        method: "POST",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as JobReportResponse;
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to submit this report.");
      }
      return result;
    },
    onSuccess: (result) => {
      setSelectedPostId(null);
      setReportMessage("");
      toast.success(result.message);
    },
    onError: (error) => toast.error(error.message),
  });

  const deletePostMutation = useMutation<
    DeleteHelpWantedResponse,
    Error,
    HelpWantedPost
  >({
    mutationKey: ["delete-help-wanted"],
    mutationFn: async (post) => {
      if (!token) throw new Error("Please sign in to delete this post.");
      if (!isOwnPost(post)) {
        throw new Error("You can only delete your own help post.");
      }
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error("The help wanted service is not configured.");

      const response = await fetch(
        `${apiUrl}/help-wanted/${encodeURIComponent(post?._id)}`,
        {
          method: "DELETE",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = (await response.json()) as DeleteHelpWantedResponse;
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete this help post.");
      }
      return result;
    },
    onSuccess: async (result) => {
      setPostToDelete(null);
      if (posts.length === 1 && page > 1) setPage((current) => current - 1);
      await queryClient.invalidateQueries({ queryKey: ["help-wanted"] });
      toast.success(result.message || "Help post deleted successfully.");
    },
    onError: (error) => toast.error(error.message),
  });

  const openReportForm = (helpWantedId: string) => {
    if (!token) {
      toast.error("Please sign in to report this post.");
      return;
    }
    setSelectedPostId(helpWantedId);
    setReportMessage("");
  };

  const submitReport = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPostId || !reportMessage.trim()) {
      toast.error("Please write a report message.");
      return;
    }
    reportMutation.mutate({
      helpWantedId: selectedPostId,
      message: reportMessage.trim(),
    });
  };

  return (
    <section className="bg-[#F9FAFB] px-2 py-10 md:px-0 md:py-14 lg:px-8 lg:py-16">
      <div className="container">
        {jobPostsQuery.isPending ? (
          <JobPostsSkeleton />
        ) : jobPostsQuery.isError ? (
          <div
            role="alert"
            className="flex min-h-[300px] flex-col items-center justify-center rounded-[8px] border border-red-200 bg-red-50 px-6 text-center"
          >
            <AlertCircle className="h-10 w-10 text-red-500" />
            <h2 className="mt-3 text-lg font-bold text-red-900">
              Unable to load job posts
            </h2>
            <p className="mt-1 text-sm text-red-700">
              {jobPostsQuery.error instanceof Error
                ? jobPostsQuery.error.message
                : "Please try again."}
            </p>
            <button
              type="button"
              onClick={() => jobPostsQuery.refetch()}
              className="mt-5 rounded-[5px] bg-primary px-5 py-2.5 text-xs font-bold text-white"
            >
              Try again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-[8px] border border-[#D4F0F1] bg-[#F0FEFE] text-center">
            <p className="text-sm font-semibold text-[#667481]">
              No job posts are available yet.
            </p>
          </div>
        ) : (
          <>
            <div className="flex w-full flex-col gap-4 pb-6 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-sm font-semibold text-[#667481] lg:text-base">
                {total} job post{total === 1 ? "" : "s"} found
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {sessionUser?.role !== "businessOwner" && (
                  <>
                    <Link
                      href="/job-posts/create"
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#292D73] px-4 text-xs font-bold text-white shadow-[0_7px_16px_rgba(41,45,115,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#1F2464] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4365D0] focus-visible:ring-offset-2"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Add Job Post
                    </Link>
                    <Link
                      href="/add-your-business"
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#292D73] bg-white px-4 text-xs font-bold text-[#292D73] transition duration-300 hover:-translate-y-0.5 hover:bg-[#EEF2FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4365D0] focus-visible:ring-offset-2"
                    >
                      <BriefcaseBusiness className="h-4 w-4" />
                      Add your business
                    </Link>
                  </>
                )}
                <div
                  className="inline-flex items-center rounded-lg border border-[#D8DEE8] bg-white p-1 shadow-sm"
                  role="group"
                  aria-label="Choose job posts view"
                >
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    aria-pressed={viewMode === "list"}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-semibold transition ${
                      viewMode === "list"
                        ? "bg-primary text-white"
                        : "text-[#667085] hover:bg-[#F2F4F7] hover:text-primary"
                    }`}
                  >
                    <List className="h-4 w-4" />
                    <span className="hidden sm:inline">List</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    aria-pressed={viewMode === "grid"}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-semibold transition ${
                      viewMode === "grid"
                        ? "bg-primary text-white"
                        : "text-[#667085] hover:bg-[#F2F4F7] hover:text-primary"
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span className="hidden sm:inline">Grid</span>
                  </button>
                </div>
              </div>
            </div>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
                  : "space-y-4"
              }
            >
              {posts.map((post) => {
                const populatedUser =
                  typeof post.userId === "object" ? post.userId : undefined;
                const profileImage =
                  post.profilePicture || populatedUser?.profilePicture;
                const publicUsername = normalizePublicUsername(
                  populatedUser?.username || post.username,
                );

                if (viewMode === "list") {
                  return (
                    <article
                      key={post._id}
                      className="group relative overflow-hidden rounded-xl border border-[#E3E8EF] bg-white shadow-[0_4px_16px_rgba(30,45,75,0.07)] transition duration-300 hover:-translate-y-0.5 hover:border-[#B9C9DC] hover:shadow-[0_12px_28px_rgba(30,45,75,0.12)]"
                    >
                      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#292D73] to-[#0082D7]" />
                      <div className="flex flex-col gap-4 p-4 pl-5 sm:pl-6 lg:flex-row lg:items-center">
                        <div className="flex min-w-0 flex-1 items-start gap-3.5">
                          <button
                            type="button"
                            onClick={() => setPostToView(post)}
                            className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-lg font-extrabold uppercase text-white shadow-[0_6px_16px_rgba(41,45,115,0.18)] ring-2 ring-white transition hover:ring-[#4365D0]/30"
                            aria-label={`View ${publicUsername}'s job details`}
                          >
                            {profileImage ? (
                              <Image
                                src={profileImage}
                                alt={publicUsername}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            ) : (
                              publicUsername.charAt(0)
                            )}
                          </button>
                          <div className="min-w-0 flex-1">
                            <div className="flex min-h-8 items-center">
                              <button
                                type="button"
                                onClick={() => setPostToView(post)}
                                className="truncate text-base font-extrabold leading-8 text-primary transition hover:text-[#4365D0] hover:underline"
                              >
                                @{publicUsername}
                              </button>
                            </div>
                            <p className="mt-1.5 text-xs font-bold text-[#344054]">
                              Looking for {post.category} service
                            </p>
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#667085]">
                              {post.message}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
                          <button
                            type="button"
                            onClick={() => openReportForm(post._id)}
                            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-[#D0D5DD] bg-white px-3 text-[11px] font-bold text-[#667085] transition hover:border-[#98A2B3] hover:bg-[#F2F4F7]"
                          >
                            <Flag className="h-3.5 w-3.5" />
                            Report
                          </button>
                          <Link
                            href={`mailto:${post.email}`}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#1F2464]"
                          >
                            <Mail className="h-4 w-4" />
                            Respond by email
                          </Link>
                          {isOwnPost(post) && (
                            <button
                              type="button"
                              onClick={() => setPostToDelete(post)}
                              disabled={
                                deletePostMutation.isPending &&
                                deletePostMutation.variables?._id === post._id
                              }
                              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
                              aria-label="Delete your help post"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                }

                return (
                <article
                  key={post._id}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#D4E6E8] bg-[#F0FEFE] shadow-[0_7px_18px_rgba(19,35,68,0.10)] transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-[#A9E1E5] hover:shadow-[0_16px_32px_rgba(19,35,68,0.16)] motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <div className="flex h-full flex-col px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setPostToView(post)}
                          className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-lg font-extrabold uppercase text-white shadow-[0_3px_10px_rgba(41,45,115,0.22)] ring-2 ring-white transition hover:ring-[#4365D0]/30 sm:h-12 sm:w-12"
                          aria-label={`View ${publicUsername}'s job details`}
                        >
                          {profileImage ? (
                            <Image
                              src={profileImage}
                              alt={publicUsername}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            publicUsername.charAt(0)
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setPostToView(post)}
                          className="min-w-0 truncate text-sm font-bold leading-normal text-primary transition hover:text-[#4365D0] hover:underline md:text-base"
                        >
                          @{publicUsername}
                        </button>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openReportForm(post._id)}
                          className="inline-flex h-7 items-center justify-center gap-1 rounded-md border border-[#D0D5DD] bg-white px-2 text-[10px] font-bold text-[#667085] transition hover:bg-[#F2F4F7]"
                        >
                          <Flag className="h-3 w-3" />
                          Report
                        </button>
                        {isOwnPost(post) && (
                          <button
                            type="button"
                            onClick={() => setPostToDelete(post)}
                            disabled={
                              deletePostMutation.isPending &&
                              deletePostMutation.variables?._id === post._id
                            }
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
                            aria-label="Delete your help post"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="my-4 h-px bg-[#86D6E4]" />

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-normal text-[#667481] md:text-sm">
                      <p>
                        Category: <span className="text-primary">{post.category}</span>
                      </p>
                      <p>
                        Zip code: <span className="text-primary">{post.zipcode}</span>
                      </p>
                    </div>

                    <h3 className="mt-3 text-[12px] font-semibold leading-relaxed text-[#1F2937] sm:text-[13px]">
                      Looking for {post.category} service
                    </h3>
                    <p className="mt-3 max-w-[980px] whitespace-pre-wrap text-xs font-medium leading-normal text-[#434343] md:text-sm sm:text-[12px]">
                      {post.message}
                    </p>
                    <p className="mt-3 text-[10px] font-medium text-[#7A8793]">
                      Posted {new Date(post.createdAt).toLocaleDateString()}
                    </p>

                    <div className="mt-auto pt-5">
                      <Link
                        href={`mailto:${post.email}`}
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 text-xs font-bold text-white shadow-[0_5px_12px_rgba(41,45,115,0.18)] transition hover:bg-[#1F2464] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73] focus-visible:ring-offset-2"
                      >
                        <Mail className="h-4 w-4" />
                        Respond by email
                      </Link>
                    </div>
                  </div>
                </article>
                );
              })}
            </div>

            {totalPages > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Job posts pagination">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1 || jobPostsQuery.isFetching}
                  className="flex h-8 w-8 items-center justify-center rounded border border-[#B8C0CC] text-[#667085] disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      disabled={jobPostsQuery.isFetching}
                      className={`flex h-8 w-8 items-center justify-center rounded border text-xs font-bold ${
                        page === pageNumber
                          ? "border-primary bg-primary text-white"
                          : "border-[#B8C0CC] text-[#475467]"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page === totalPages || jobPostsQuery.isFetching}
                  className="flex h-8 w-8 items-center justify-center rounded border border-[#B8C0CC] text-[#667085] disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </>
        )}
      </div>

      {postToView && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#101828]/70 px-4 py-6 backdrop-blur-[3px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="job-details-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPostToView(null);
          }}
        >
          <div className="relative max-h-[calc(100vh-3rem)] w-full max-w-[680px] overflow-y-auto rounded-[20px] border border-white/70 bg-white shadow-[0_30px_90px_rgba(16,24,40,0.32)]">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#292D73] via-[#303C88] to-[#1683A4] px-5 pb-6 pt-5 text-white sm:px-7 sm:pb-7">
              <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-20 left-16 h-40 w-40 rounded-full bg-cyan-300/10 blur-2xl" />
              <button
                type="button"
                onClick={() => setPostToView(null)}
                className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 transition hover:rotate-90 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                aria-label="Close job details"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative z-[1] flex items-center gap-4 pr-10">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/80 bg-white/15 text-xl font-extrabold uppercase text-white shadow-[0_10px_25px_rgba(0,0,0,0.18)] sm:h-[72px] sm:w-[72px]">
                  {viewedPostProfileImage ? (
                    <Image
                      src={viewedPostProfileImage}
                      alt={viewedPostUsername}
                      fill
                      sizes="72px"
                      className="object-cover"
                    />
                  ) : (
                    viewedPostUsername.charAt(0)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                    Help Wanted
                  </p>
                  <p className="mt-1 truncate text-base font-extrabold sm:text-lg">
                    @{viewedPostUsername}
                  </p>
                  <span className="mt-2 inline-flex rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                    {postToView.category}
                  </span>
                </div>
              </div>

              <h2
                id="job-details-title"
                className="relative z-[1] mt-5 text-xl font-extrabold leading-tight sm:text-[26px]"
              >
                Looking for {postToView.category} service
              </h2>
            </div>

            <div className="space-y-5 bg-[#F8FAFC] p-5 sm:p-7">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: "Posted by",
                    value: `@${viewedPostUsername}`,
                    icon: UserRound,
                  },
                  { label: "Zip code", value: postToView.zipcode, icon: MapPin },
                  {
                    label: "Posted on",
                    value: new Date(postToView.createdAt).toLocaleDateString(),
                    icon: CalendarDays,
                  },
                ].map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex min-w-0 items-start gap-3 rounded-xl border border-[#E3E8EF] bg-white p-3.5 shadow-[0_3px_10px_rgba(16,24,40,0.04)]"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF1FF] text-[#4365D0]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#98A2B3]">
                        {label}
                      </p>
                      <p className="mt-1 break-words text-sm font-semibold text-[#344054]">
                        {value || "Not provided"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-[#E1E7EF] bg-white p-5 shadow-[0_5px_16px_rgba(16,24,40,0.05)]">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F7F7] text-[#1683A4]">
                    <BriefcaseBusiness className="h-4 w-4" />
                  </span>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#667085]">
                  Job details
                  </p>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm font-medium leading-6 text-[#475467]">
                  {postToView.message}
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setPostToView(null)}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-[#D0D5DD] bg-white px-6 text-xs font-bold text-[#475467] transition hover:border-[#98A2B3] hover:bg-[#F2F4F7]"
                >
                  Close
                </button>
                <Link
                  href={`mailto:${postToView.email}`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-xs font-extrabold text-white shadow-[0_8px_18px_rgba(41,45,115,0.18)] transition hover:-translate-y-0.5 hover:bg-[#1F2464]"
                >
                  <Mail className="h-4 w-4" />
                  Respond by email
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedPostId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/55 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="job-report-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !reportMutation.isPending) {
              setSelectedPostId(null);
            }
          }}
        >
          <form
            onSubmit={submitReport}
            className="relative w-full max-w-[520px] rounded-[10px] bg-white p-5 shadow-2xl sm:p-6"
          >
            <button
              type="button"
              onClick={() => setSelectedPostId(null)}
              disabled={reportMutation.isPending}
              className="absolute right-4 top-4 rounded p-1 text-[#667085] hover:bg-[#F2F4F7] disabled:opacity-50"
              aria-label="Close report form"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 id="job-report-title" className="text-xl font-extrabold text-primary">
              Report Job Post
            </h2>
            <p className="mt-1 text-xs text-[#667085]">
              Tell us why this post should be reviewed by an administrator.
            </p>
            <label
              htmlFor="reported-job-username"
              className="mt-5 block text-xs font-semibold text-[#344054]"
            >
              Username
            </label>
            <input
              id="reported-job-username"
              type="text"
              value={selectedReportUsername || "Unknown user"}
              readOnly
              aria-readonly="true"
              className="mt-2 h-11 w-full cursor-default rounded-[5px] border border-[#D7DEE8] bg-[#F6F8FB] px-4 text-sm font-semibold text-primary outline-none"
            />
            <label htmlFor="job-report-message" className="mt-5 block text-xs font-semibold text-[#344054]">
              Report message
            </label>
            <textarea
              id="job-report-message"
              required
              autoFocus
              value={reportMessage}
              onChange={(event) => setReportMessage(event.target.value)}
              placeholder="This post looks like spam or scam content..."
              className="mt-2 min-h-[150px] w-full resize-none rounded-[5px] border border-[#B8C0CC] px-4 py-3 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedPostId(null)}
                disabled={reportMutation.isPending}
                className="h-10 rounded-[5px] border border-[#B8C0CC] px-5 text-xs font-bold text-[#475467] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reportMutation.isPending}
                className="h-10 rounded-[5px] bg-primary px-6 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {reportMutation.isPending ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        </div>
      )}
      <DeleteModal
        isOpen={Boolean(postToDelete)}
        onClose={() => {
          if (!deletePostMutation.isPending) setPostToDelete(null);
        }}
        onConfirm={() => {
          if (postToDelete && !deletePostMutation.isPending) {
            deletePostMutation.mutate(postToDelete);
          }
        }}
        title="Delete help post?"
        desc="Are you sure you want to delete your help post? This action cannot be undone."
      />
    </section>
  );
};

export default JobPostsContainer;
