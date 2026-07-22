"use client";

import { Skeleton } from "@/components/ui/skeleton";
import DeleteModal from "@/components/modals/delete-modal";
import { useProfileQuery } from "@/hooks/APicalling";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
  Mail,
  Phone,
  Trash2,
  X,
} from "lucide-react";
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
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
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
          <div className="w-full flex items-center justify-between gap-4 pb-6">
              <p className="mb-4 text-sm lg:text-base font-semibold text-[#667481]">
              {total} job post{total === 1 ? "" : "s"} found
            </p>
            <div>
              {
            sessionUser?.role !== "businessOwner" &&  <div className="flex items-center gap-5">

              <Link
            href="/job-posts/create"
            className="inline-flex h-9 items-center justify-center rounded-[5px] bg-[#22245F] px-5 text-[13px] font-semibold text-white transition hover:bg-[#17194D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22245F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E6F2F2]"
          >
            Add Job Post
          </Link>

              <Link
            href="/add-your-business"
            className="inline-flex h-9 items-center justify-center rounded-[5px] bg-[#22245F] px-5 text-[13px] font-semibold text-white transition hover:bg-[#17194D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22245F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E6F2F2]"
          >
            Add your business
          </Link>
            </div>

          }
          </div>
            </div>
            <div className="space-y-5 sm:space-y-6">
              {posts.map((post) => (
                <article
                  key={post._id}
                  className="overflow-hidden rounded-[8px] border border-[#D4F0F1] bg-[#F0FEFE] shadow-[0_8px_18px_rgba(19,35,68,0.14)] transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-[#A9E1E5] hover:shadow-[0_16px_32px_rgba(19,35,68,0.18)] motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <div className="px-4 pb-4 pt-4 sm:px-5 sm:pb-5 lg:px-6">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-extrabold uppercase text-white shadow-[0_3px_10px_rgba(41,45,115,0.22)] sm:h-12 sm:w-12">
                        {post?.profilePicture || post.username.trim().charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-bold leading-normal text-primary md:text-base">
                          {post.username}
                        </h2>
                        <p className="truncate text-xs font-normal leading-normal text-[#667481] sm:text-[11px]">
                          {post.email}
                        </p>
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
                      {post.phone && (
                        <Link href={`tel:${post.phone}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                          <Phone className="h-3.5 w-3.5" />
                          {post.phone}
                        </Link>
                      )}
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

                    <div className="mt-5 flex flex-col justify-start gap-2 sm:flex-row sm:justify-end">
                      {isOwnPost(post) && (
                        <button
                          type="button"
                          onClick={() => setPostToDelete(post)}
                          disabled={
                            deletePostMutation.isPending &&
                            deletePostMutation.variables?._id === post._id
                          }
                          className="inline-flex h-9 w-full items-center justify-center rounded-[5px] border border-red-500 bg-white px-1 text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-9"
                          aria-label="Delete your help post"
                        >
                          <Trash2 className="h-6 w-6" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openReportForm(post._id)}
                        className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-[5px] bg-[#9D9D9D] px-4 text-xs font-extrabold text-white transition hover:bg-[#858585] sm:w-auto sm:min-w-[130px] md:text-sm"
                      >
                        <Flag className="h-4 w-4" />
                        Report
                      </button>
                      <Link
                        href={`mailto:${post?.email}`}
                        className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-[5px] bg-primary px-4 text-xs font-extrabold text-white shadow-[0_5px_12px_rgba(41,45,115,0.22)] transition hover:bg-[#1F2464] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73] focus-visible:ring-offset-2 sm:w-auto sm:min-w-[198px] md:text-sm"
                      >
                        <Mail className="h-5 w-5" />
                        Contact through email
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
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

      {selectedPostId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
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
