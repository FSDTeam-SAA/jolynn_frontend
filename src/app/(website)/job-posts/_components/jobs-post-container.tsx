"use client";

import { Skeleton } from "@/components/ui/skeleton";
import DeleteModal from "@/components/modals/delete-modal";
import { useProfileQuery } from "@/hooks/APicalling";
import { useServiceCategories } from "@/hooks/use-service-categories";
import {
  useLocationCities,
  useLocationStates,
} from "@/hooks/use-location-options";
import { normalizePublicUsername } from "@/lib/public-username";
import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  AlertCircle,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Flag,
  ImageIcon,
  LayoutGrid,
  List,
  LogIn,
  Mail,
  MapPin,
  PlusCircle,
  Search,
  UserRound,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type HelpWantedUser = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  phoneNumber?: string;
  profilePicture?: string;
};

type HelpWantedImage = {
  url: string;
  publicId: string;
};

type HelpWantedPost = {
  _id: string;
  // Mongoose populate returns null when the referenced user no longer exists.
  userId?: string | HelpWantedUser | null;
  username: string;
  email: string;
  zipcode: string;
  state?: string;
  city?: string;
  category: string;
  budgetRange?: string;
  profilePicture: string;
  phone: string;
  message: string;
  images?: HelpWantedImage[];
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

const PAGE_LIMIT = 9;
type ViewMode = "grid" | "list";
type SignInIntent = "report" | "create" | "business" | "sidequote";
type JobPostFilters = {
  category: string;
  state: string;
  city: string;
  budgetRange: string;
};

type CompactDropdownProps = {
  value: string;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

const CompactDropdown = ({
  value,
  options,
  placeholder,
  disabled = false,
  onChange,
}: CompactDropdownProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-full items-center justify-between rounded-[6px] border border-[#A7A7A7] bg-white px-3 pr-10 text-left text-[12px] font-medium text-[#344054] outline-none disabled:cursor-not-allowed disabled:bg-[#F8FAFC]"
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-[#667085]" />
      </button>
      {open && !disabled && (
        <div className="absolute inset-x-0 top-[calc(100%+4px)] z-50 max-h-52 overflow-y-auto rounded-md border border-[#D0D5DD] bg-white p-1 shadow-[0_10px_24px_rgba(16,24,40,0.18)]">
          <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="block w-full rounded px-2.5 py-2 text-left text-xs text-[#667085] hover:bg-[#F2F4F7]">
            {placeholder}
          </button>
          {options.map((option) => (
            <button key={option} type="button" onClick={() => { onChange(option); setOpen(false); }} className={`block w-full rounded px-2.5 py-2 text-left text-xs ${value === option ? "bg-[#EEF2FF] font-semibold text-[#292D73]" : "text-[#344054] hover:bg-[#F2F4F7]"}`}>
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const excludedStateNames = new Set([
  "armed forces pacific",
  "armed forces of the americas",
]);

const getPopulatedUser = (post: HelpWantedPost): HelpWantedUser | undefined =>
  post.userId !== null && typeof post.userId === "object"
    ? post.userId
    : undefined;

const getPostUserId = (post: HelpWantedPost) =>
  typeof post.userId === "string" ? post.userId : getPopulatedUser(post)?._id;

const fetchJobPosts = async (
  page: number,
  searchTerm: string,
  category: string,
  state: string,
  city: string,
  budgetRange: string,
): Promise<HelpWantedResponse> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("The help wanted service is not configured.");

  const params = new URLSearchParams({
    sortBy: "createdAt",
    limit: String(PAGE_LIMIT),
    page: String(page),
  });
  if (searchTerm.trim()) params.set("searchTerm", searchTerm.trim());
  if (category.trim()) params.set("category", category.trim());
  if (state.trim()) params.set("state", state.trim());
  if (city.trim()) params.set("city", city.trim());
  if (budgetRange.trim()) params.set("budgetRange", budgetRange.trim());
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
  const router = useRouter();
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
    const populatedUserEmail = getPopulatedUser(post)?.email;
    const postEmails = [post.email, populatedUserEmail]
      .filter(Boolean)
      .map((email) => email!.trim().toLowerCase());

    return Boolean(
      (currentUserId && postUserId === currentUserId) ||
      (currentUserEmail && postEmails.includes(currentUserEmail)),
    );
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [draftFilters, setDraftFilters] = useState<JobPostFilters>({
    category: "",
    state: "",
    city: "",
    budgetRange: "",
  });
  const [appliedFilters, setAppliedFilters] = useState<JobPostFilters>({
    category: "",
    state: "",
    city: "",
    budgetRange: "",
  });
  const categoriesQuery = useServiceCategories();
  const statesQuery = useLocationStates();
  const states = (statesQuery.data?.data ?? []).filter(
    (state) => !excludedStateNames.has(state.name.trim().toLowerCase()),
  );
  const selectedState = states.find(
    (state) => state.name === draftFilters.state,
  );
  const citiesQuery = useLocationCities(selectedState);
  const cities = citiesQuery.data?.data.cities ?? [];
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [postToView, setPostToView] = useState<HelpWantedPost | null>(null);
  const [postToDelete, setPostToDelete] = useState<HelpWantedPost | null>(null);
  const [reportMessage, setReportMessage] = useState("");
  const [signInIntent, setSignInIntent] = useState<SignInIntent | null>(null);
  const [showExistingBusinessNotice, setShowExistingBusinessNotice] =
    useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const jobPostsQuery = useInfiniteQuery<
    HelpWantedResponse,
    Error,
    InfiniteData<HelpWantedResponse>,
    readonly ["help-wanted", number, string, string, string, string, string],
    number
  >({
    queryKey: [
      "help-wanted",
      PAGE_LIMIT,
      searchTerm,
      appliedFilters.category,
      appliedFilters.state,
      appliedFilters.city,
      appliedFilters.budgetRange,
    ],
    queryFn: ({ pageParam }) =>
      fetchJobPosts(
        pageParam,
        searchTerm,
        appliedFilters.category,
        appliedFilters.state,
        appliedFilters.city,
        appliedFilters.budgetRange,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page: currentPage, limit, total } = lastPage.meta;
      return currentPage * limit < total ? currentPage + 1 : undefined;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const posts = jobPostsQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const total = jobPostsQuery.data?.pages.at(-1)?.meta.total ?? 0;

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;
    if (
      !loadMoreElement ||
      !jobPostsQuery.hasNextPage ||
      jobPostsQuery.isFetchingNextPage
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void jobPostsQuery.fetchNextPage();
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(loadMoreElement);
    return () => observer.disconnect();
  }, [
    jobPostsQuery.fetchNextPage,
    jobPostsQuery.hasNextPage,
    jobPostsQuery.isFetchingNextPage,
  ]);
  const selectedReportPost = posts.find((post) => post._id === selectedPostId);
  const selectedReportUsername = selectedReportPost
    ? getPopulatedUser(selectedReportPost)?.username ||
      selectedReportPost.username
    : "";
  const viewedPostUser = postToView ? getPopulatedUser(postToView) : undefined;
  const viewedPostUsername = postToView
    ? normalizePublicUsername(viewedPostUser?.username || postToView.username)
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
      if (!apiUrl)
        throw new Error("The help wanted service is not configured.");

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
      await queryClient.invalidateQueries({ queryKey: ["help-wanted"] });
      toast.success(result.message || "Help post deleted successfully.");
    },
    onError: (error) => toast.error(error.message),
  });

  const openReportForm = (helpWantedId: string) => {
    if (!token) {
      setSignInIntent("report");
      return;
    }
    setSelectedPostId(helpWantedId);
    setReportMessage("");
  };

  const openCreatePost = () => {
    if (!token) {
      setSignInIntent("create");
      return;
    }

    router.push("/job-posts/create");
  };

  const openAddBusiness = () => {
    const currentRole = profile?.role ?? sessionUser?.role;

    if (currentRole === "businessOwner") {
      setShowExistingBusinessNotice(true);
      return;
    }

    router.push("/add-your-business");
  };

  const openSideQuote = (email: string) => {
    if (!token) {
      setSignInIntent("sidequote");
      return;
    }

    window.location.href = `mailto:${email}`;
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

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedFilters(draftFilters);
    void jobPostsQuery.refetch();
  };

  const updateFilter = (changes: Partial<JobPostFilters>) => {
    setDraftFilters((current) => ({ ...current, ...changes }));
    setAppliedFilters((current) => ({ ...current, ...changes }));
  };

  const resetFilters = () => {
    const reset = { category: "", state: "", city: "", budgetRange: "" };
    setDraftFilters(reset);
    setAppliedFilters(reset);
  };

  return (
    <section className="bg-[#F9FAFB] px-2 py-10 md:px-0 md:py-14 lg:px-8 lg:py-16">
      <div className="container">
        <div className="mb-6 grid items-center gap-3 sm:grid-cols-[auto_minmax(220px,1fr)_auto]">
          <p className="order-1 shrink-0 text-sm font-semibold text-[#667481]" aria-live="polite">
            {jobPostsQuery.isPending ? "Finding job posts..." : `${total} job post${total === 1 ? "" : "s"} found`}
          </p>
          <label className="order-2 flex h-10 w-full items-center gap-2 rounded-lg border border-[#D8DEE8] bg-white px-3 sm:mx-auto sm:max-w-md">
            <Search className="h-4 w-4 shrink-0 text-[#667085]" />
            <span className="sr-only">Global search job posts</span>
            <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search job posts..." className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#344054] outline-none placeholder:text-[#98A2B3]" />
          </label>
          <div className="order-3 flex flex-wrap items-center justify-start gap-2 sm:justify-end">
          <button
            type="button"
            onClick={openCreatePost}
            className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg bg-[#292D73] px-4 text-xs font-bold text-white shadow-[0_7px_16px_rgba(41,45,115,0.18)] transition hover:bg-[#1F2464]"
          >
            <PlusCircle className="h-4 w-4" />
            Add Job Post
          </button>
          <button
            type="button"
            onClick={openAddBusiness}
            className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg border border-[#292D73] bg-white px-4 text-xs font-bold text-[#292D73] transition hover:bg-[#EEF2FF]"
          >
            <BriefcaseBusiness className="h-4 w-4" />
            Add your business
          </button>
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

        <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="h-fit rounded-[8px] bg-white p-5 shadow-[0_8px_24px_rgba(30,45,75,0.13)] ring-1 ring-[#E8ECF2] lg:sticky lg:top-24">
            <h2 className="text-[16px] font-semibold text-[#111827]">Filter Results</h2>
            <form onSubmit={applyFilters} className="mt-5 space-y-3">
              <CompactDropdown value={draftFilters.category} options={(categoriesQuery.data?.data ?? []).filter((category) => category.isActive).map((category) => category.name)} placeholder={categoriesQuery.isPending ? "Loading categories..." : "Select Category"} disabled={categoriesQuery.isPending || categoriesQuery.isError} onChange={(category) => updateFilter({ category })} />
              <CompactDropdown value={draftFilters.state} options={states.map((state) => state.name)} placeholder={statesQuery.isPending ? "Loading states..." : "State"} disabled={statesQuery.isPending || statesQuery.isError} onChange={(state) => updateFilter({ state, city: "" })} />
              <CompactDropdown value={draftFilters.city} options={cities} placeholder={!selectedState ? "Select State First" : citiesQuery.isPending ? "Loading cities..." : "City"} disabled={!selectedState || citiesQuery.isPending || citiesQuery.isError} onChange={(city) => updateFilter({ city })} />
              <CompactDropdown value={draftFilters.budgetRange} options={["$0 - $500", "$500 - $1,000", "$1,000 - $2,500", "$2,500 - $5,000", "$5,000 - $10,000", "$10,000 - $50,000"]} placeholder="Budget Range" onChange={(budgetRange) => updateFilter({ budgetRange })} />
              <button type="submit" disabled={jobPostsQuery.isFetching} className="h-11 w-full rounded-[6px] bg-[#292D73] text-[12px] font-extrabold text-white transition hover:bg-[#20255F] disabled:cursor-wait disabled:opacity-60">Apply Filters</button>
              <button type="button" onClick={resetFilters} className="h-11 w-full rounded-[6px] bg-[#EEEEEE] text-[11px] font-extrabold text-[#292D73] transition hover:bg-[#E5E7EB]">Reset</button>
            </form>
          </aside>
          <div>

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
              {searchTerm.trim() || Object.values(appliedFilters).some(Boolean)
                ? "No job posts match your filters."
                : "No job posts are available yet."}
            </p>
          </div>
        ) : (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
                  : "space-y-2"
              }
            >
              {posts.map((post) => {
                const populatedUser = getPopulatedUser(post);
                const profileImage =
                  post.profilePicture || populatedUser?.profilePicture;
                const publicUsername = normalizePublicUsername(
                  populatedUser?.username || post.username,
                );

                if (viewMode === "list") {
                  return (
                    <article
                      key={post._id}
                      className="rounded-lg border border-[#E3E8EF] bg-white transition-colors hover:border-[#B9C9DC] hover:bg-[#FCFDFE]"
                    >
                      <div className="flex flex-col gap-2.5 p-3 sm:flex-row sm:items-center">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setPostToView(post)}
                            className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-base font-extrabold uppercase text-white"
                            aria-label={`View ${publicUsername}'s job details`}
                          >
                            {profileImage ? (
                              <Image
                                src={profileImage}
                                alt={publicUsername}
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            ) : (
                              publicUsername.charAt(0)
                            )}
                          </button>
                          <div className="min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => setPostToView(post)}
                              className="truncate text-sm font-bold leading-6 text-primary transition hover:text-[#4365D0] hover:underline"
                            >
                              @{publicUsername}
                            </button>
                            <p className="text-xs font-medium text-[#344054]">
                              Looking for {post.category} service
                            </p>
                            {(post.city || post.state || post.zipcode) && (
                              <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-[#667481]">
                                <MapPin className="h-3 w-3 shrink-0 text-[#292D73]" />
                                {[post.city, post.state, post.zipcode].filter(Boolean).join(", ")}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center">
                          <button
                            type="button"
                            onClick={() => setPostToView(post)}
                            className="inline-flex h-9 items-center justify-center gap-1 rounded-md border border-[#292D73] bg-white px-3 text-[11px] font-bold text-[#292D73] transition hover:bg-[#EEF2FF]"
                            aria-label={`View full details for ${post.category} service post`}
                          >
                            View More
                            <ChevronRight
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          </button>
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
                          Category :{" "}
                          <span className="text-primary">{post.category}</span>
                        </p>
                        <p>
                          Zip code :{" "}
                          <span className="text-primary">{post.zipcode}</span>
                        </p>
                        {(post.city || post.state) && (
                          <p className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-[#292D73]" />
                            <span className="text-primary">
                              {[post.city, post.state].filter(Boolean).join(", ")}
                            </span>
                          </p>
                        )}
                        <p>
                          Budget :{" "}
                          <span className="text-primary">
                            {post.budgetRange || "Not provided"}
                          </span>
                        </p>
                      </div>

                      <div className="mt-3 min-w-0 px-0 py-1">
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#7A8793]">
                          Requirements : 
                        </p>
                        {/* <h3 className="mt-1.5 break-words text-[12px] font-bold leading-5 text-[#1F2937] sm:text-[13px]">
                          Looking for {post.category} service
                        </h3> */}
                        <p className="mt-0 line-clamp-2 min-h-10 max-w-full whitespace-pre-wrap break-words text-xs font-normal leading-5 text-[#52606D] sm:text-[13px]">
                          {post.message.length > 90
                            ? `${post.message.slice(0, 90).trim()}…`
                            : post.message}
                        </p>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between gap-3">
                        <p className="text-[10px] font-medium text-[#7A8793]">
                          Posted {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                        <button
                          type="button"
                          onClick={() => setPostToView(post)}
                          className="inline-flex shrink-0 items-center gap-0.5 rounded px-1 py-0.5 text-[11px] font-bold text-[#292D73] transition hover:text-[#0082D7] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4365D0]/40"
                          aria-label={`View full details for ${post.category} service post`}
                        >
                          View More
                          <ChevronRight
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        </button>
                      </div>

                      <div className="mt-auto pt-4">
                        <button
                          type="button"
                          onClick={() => openSideQuote(post.email)}
                          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 text-xs font-bold text-white shadow-[0_5px_12px_rgba(41,45,115,0.18)] transition hover:bg-[#1F2464] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73] focus-visible:ring-offset-2"
                        >
                          <Mail className="h-4 w-4" />
                          SideQuote
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div
              ref={loadMoreRef}
              className="flex min-h-16 items-center justify-center py-6"
              aria-live="polite"
            >
              {jobPostsQuery.isFetchingNextPage ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-[#667085]">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#D0D5DD] border-t-[#292D73]" />
                  Loading more job posts...
                </div>
              ) : jobPostsQuery.hasNextPage ? (
                <p className="text-xs font-medium text-[#98A2B3]">
                  Scroll to load more job posts
                </p>
              ) : (
                <p className="text-xs font-medium text-[#98A2B3]">
                  You&apos;ve reached the end of the job posts.
                </p>
              )}
            </div>
          </>
        )}
      </div>
        </div>
      </div>

      {postToView && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#101828]/60 px-3 py-5 backdrop-blur-sm sm:px-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="job-details-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPostToView(null);
          }}
        >
          <div className="relative max-h-[calc(100dvh-2.5rem)] w-full max-w-[640px] overflow-x-hidden overflow-y-auto rounded-2xl border border-[#E1E7EF] bg-white shadow-[0_24px_70px_rgba(16,24,40,0.28)]">
            <div className="relative border-b border-[#E5EAF0] bg-white px-5 py-5 sm:px-6">
              <button
                type="button"
                onClick={() => setPostToView(null)}
                className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#DDE3EA] bg-[#F8FAFC] text-[#667085] transition hover:border-[#C7D0DB] hover:bg-[#EEF2F6] hover:text-[#292D73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4365D0]/40"
                aria-label="Close job details"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex min-w-0 items-center gap-3.5 pr-11">
                <div className="relative flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#292D73] text-lg font-extrabold uppercase text-white shadow-sm">
                  {viewedPostProfileImage ? (
                    <Image
                      src={viewedPostProfileImage}
                      alt={viewedPostUsername}
                      fill
                      sizes="52px"
                      className="object-cover"
                    />
                  ) : (
                    viewedPostUsername.charAt(0)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#8A94A6]">
                    Help Wanted
                  </p>
                  <p className="mt-1 truncate text-base font-extrabold text-[#292D73]">
                    @{viewedPostUsername}
                  </p>
                  <span className="mt-1.5 inline-flex rounded-full bg-[#EEF1FF] px-2.5 py-1 text-[10px] font-bold text-[#4365D0]">
                    {postToView.category}
                  </span>
                </div>
              </div>

              <h2
                id="job-details-title"
                className="mt-4 break-words pr-10 text-xl font-extrabold leading-snug text-[#1D2939] sm:text-2xl"
              >
                Looking for {postToView.category} service
              </h2>
            </div>

            <div className="min-w-0 space-y-4 bg-[#F8FAFC] p-4 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    label: "Posted by",
                    value: `@${viewedPostUsername}`,
                    icon: UserRound,
                  },
                  {
                    label: "Zip code",
                    value: postToView.zipcode,
                    icon: MapPin,
                  },
                  {
                    label: "Budget",
                    value: postToView.budgetRange || "Not provided",
                    icon: BriefcaseBusiness,
                  },
                  {
                    label: "Posted on",
                    value: new Date(postToView.createdAt).toLocaleDateString(),
                    icon: CalendarDays,
                  },
                ].map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex min-w-0 items-center gap-2.5 rounded-xl border border-[#E1E7EF] bg-white p-3"
                  >
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF1FF] text-[#4365D0]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#98A2B3]">
                        {label}
                      </p>
                      <p className="mt-0.5 break-words text-[13px] font-bold text-[#344054]">
                        {value || "Not provided"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="min-w-0 overflow-hidden rounded-xl border border-[#E1E7EF] bg-white p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F7F7] text-[#1683A4]">
                    <BriefcaseBusiness className="h-4 w-4" />
                  </span>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#667085]">
                    Job details
                  </p>
                </div>
                <p className="mt-3 max-w-full whitespace-pre-wrap break-words text-sm font-normal leading-6 text-[#475467]">
                  {postToView.message}
                </p>
              </div>

              {postToView.images && postToView.images.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-[#E1E7EF] bg-white p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF1FF] text-[#4365D0]">
                      <ImageIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#667085]">
                        Uploaded images
                      </p>
                      <p className="text-[11px] text-[#98A2B3]">
                        {postToView.images.length} image{postToView.images.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {postToView.images.map((image, index) => (
                      <a
                        key={image.publicId || image.url}
                        href={image.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-[#D0D5DD] bg-white p-0.5 shadow-sm transition hover:border-[#4365D0] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#4365D0] focus:ring-offset-2"
                        aria-label={`Open uploaded image ${index + 1} in a new tab`}
                      >
                        <Image
                          src={image.url}
                          alt={`Uploaded image ${index + 1} for ${postToView.category} request`}
                          fill
                          sizes="(max-width: 640px) 45vw, 180px"
                          className="rounded-[5px] object-cover transition duration-200 group-hover:scale-105"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col-reverse gap-2.5 pt-1 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setPostToView(null)}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-[#D0D5DD] bg-white px-5 text-xs font-bold text-[#475467] transition hover:border-[#98A2B3] hover:bg-[#F2F4F7]"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPostToView(null);
                    openReportForm(postToView._id);
                  }}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#D0D5DD] bg-white px-5 text-xs font-bold text-[#667085] transition hover:border-[#98A2B3] hover:bg-[#F2F4F7]"
                >
                  <Flag className="h-4 w-4" />
                  Report
                </button>
                <button
                  type="button"
                  onClick={() => openSideQuote(postToView.email)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-xs font-extrabold text-white shadow-[0_6px_14px_rgba(41,45,115,0.18)] transition hover:bg-[#1F2464]"
                >
                  <Mail className="h-4 w-4" />
                  SideQuote
                </button>
                {isOwnPost(postToView) && (
                  <button
                    type="button"
                    onClick={() => {
                      setPostToView(null);
                      setPostToDelete(postToView);
                    }}
                    disabled={
                      deletePostMutation.isPending &&
                      deletePostMutation.variables?._id === postToView._id
                    }
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
                    aria-label="Delete your help post"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
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
            if (
              event.target === event.currentTarget &&
              !reportMutation.isPending
            ) {
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
            <h2
              id="job-report-title"
              className="text-xl font-extrabold text-primary"
            >
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
            <label
              htmlFor="job-report-message"
              className="mt-5 block text-xs font-semibold text-[#344054]"
            >
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

      {showExistingBusinessNotice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/60 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="existing-business-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowExistingBusinessNotice(false);
            }
          }}
        >
          <div className="relative w-full max-w-[440px] overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_24px_70px_rgba(16,24,40,0.28)]">
            <div className="h-1.5 bg-[linear-gradient(90deg,#292D73_0%,#5962B8_55%,#75B8AE_100%)]" />
            <button
              type="button"
              onClick={() => setShowExistingBusinessNotice(false)}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E1E7EF] bg-[#F8FAFC] text-[#667085] transition hover:bg-[#EEF2F6] hover:text-[#292D73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4365D0]/40"
              aria-label="Close business notice"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="px-6 py-8 text-center sm:px-8">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#EEF1FF] text-[#292D73]">
                <BriefcaseBusiness className="h-7 w-7" aria-hidden="true" />
              </span>
              <h2
                id="existing-business-title"
                className="mt-5 text-xl font-extrabold text-[#171A3A] sm:text-2xl"
              >
                Your business is already listed
              </h2>
              <p className="mx-auto mt-2 max-w-[340px] text-sm leading-6 text-[#667085]">
                You already have a business in the SideQuote directory. You can
                view and manage its information from your dashboard.
              </p>

              <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setShowExistingBusinessNotice(false)}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-[#D0D5DD] bg-white px-5 text-xs font-bold text-[#475467] transition hover:bg-[#F8FAFC]"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/overview")}
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-xs font-bold text-white shadow-[0_6px_14px_rgba(41,45,115,0.18)] transition hover:bg-[#20255F]"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {signInIntent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/55 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="job-post-sign-in-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSignInIntent(null);
            }
          }}
        >
          <div className="relative w-full max-w-[430px] rounded-[14px] bg-white p-6 text-center shadow-2xl">
            <button
              type="button"
              onClick={() => setSignInIntent(null)}
              className="absolute right-4 top-4 rounded p-1 text-[#667085] transition hover:bg-[#F2F4F7]"
              aria-label="Close sign in prompt"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF0FF] text-primary">
              <LogIn className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2
              id="job-post-sign-in-title"
              className="mt-4 text-xl font-extrabold text-primary"
            >
              {signInIntent === "create"
                ? "Sign in to add a job post"
                : signInIntent === "business"
                  ? "Sign in to add your business"
                  : "Sign in to report this post"}
            </h2>
            <p className="mt-2 text-[13px] leading-5 text-[#667085]">
              {signInIntent === "create"
                ? "You need to sign in before you can create a help wanted post."
                : signInIntent === "business"
                  ? "You need to sign in before you can add your business."
                  : signInIntent === "sidequote"
                    ? "You need to sign in before you can get a SideQuote."
                    : "You need to sign in before you can submit a report."}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSignInIntent(null)}
                className="h-10 rounded-[6px] border border-[#B8C0CC] bg-white px-4 text-[13px] font-semibold text-[#344054] transition hover:bg-[#F8FAFC]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/login?callbackUrl=${encodeURIComponent(
                      signInIntent === "create"
                        ? "/job-posts/create"
                        : signInIntent === "business"
                          ? "/add-your-business"
                          : "/job-posts",
                    )}`,
                  )
                }
                className="h-10 rounded-[6px] bg-primary px-4 text-[13px] font-bold text-white transition hover:bg-[#20255F]"
              >
                Sign In
              </button>
            </div>
          </div>
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
