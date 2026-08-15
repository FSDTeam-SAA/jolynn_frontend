"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ChevronDown, CircleHelp, Search, Sparkles } from "lucide-react";
import { useState } from "react";

type FaqItem = {
  _id: string;
  question: string;
  answer: string;
  createdAt?: string;
  updatedAt?: string;
};

type FaqResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: FaqItem[];
};

const INITIAL_VISIBLE_COUNT = 5;

const fetchFaqs = async (): Promise<FaqResponse> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("The FAQ service is not configured.");
  }

  const response = await fetch(
    `${apiUrl}/faq?sortBy=createdAt&limit=50&page=1`,
    { headers: { Accept: "*/*" } },
  );

  if (!response.ok) {
    throw new Error("We couldn't load the FAQs. Please try again.");
  }

  const result = (await response.json()) as FaqResponse;

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error(result.message || "We couldn't load the FAQs.");
  }

  return result;
};

const FaqSkeleton = () => (
  <div
    className="w-full space-y-3"
    aria-label="Loading frequently asked questions"
  >
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className="flex min-h-[72px] items-center gap-4 rounded-xl border border-[#E1E7EC] bg-white px-4 shadow-sm sm:px-5"
      >
        <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
        <Skeleton className={`h-4 ${index % 2 === 0 ? "w-2/3" : "w-1/2"}`} />
        <Skeleton className="ml-auto h-8 w-8 shrink-0 rounded-full" />
      </div>
    ))}
  </div>
);

const Faq = () => {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const { data, isPending, isError, error, refetch, isFetching } =
    useQuery<FaqResponse>({
      queryKey: ["website-faqs"],
      queryFn: fetchFaqs,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    });

  const faqItems = data?.data ?? [];

  const filteredFaqs = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const visibleFaqs =
    showAll || searchQuery.trim() !== ""
      ? filteredFaqs
      : filteredFaqs.slice(0, INITIAL_VISIBLE_COUNT);

  const hasMore = filteredFaqs.length > INITIAL_VISIBLE_COUNT;

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#FFFFFF_0%,#F3F8F7_100%)] px-5 py-14 sm:px-8 md:py-16 lg:py-20"
    >
      <div className="pointer-events-none absolute -left-24 top-12 h-64 w-64 rounded-full bg-[#4365D0]/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[#44A5A0]/[0.08] blur-3xl" />

      <div className="container relative max-w-[1180px]">
        <div className="grid items-start gap-9 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
          <div className="text-center lg:sticky lg:top-28 lg:text-left">
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-[#292E78]/10 bg-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#4365D0] shadow-sm lg:mx-0">
              <CircleHelp className="h-3.5 w-3.5" />
              <span>Need Help?</span>
              {faqItems.length > 0 && (
                <span className="ml-1 rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[10px] font-extrabold text-[#292E78]">
                  {faqItems.length} FAQs
                </span>
              )}
            </div>
            <h2 className="mt-4 text-2xl font-extrabold leading-[1.15] tracking-[-0.025em] text-primary sm:text-[28px] md:text-[34px] lg:text-[38px]">
              Most Frequently Asked Questions
            </h2>
            <p className="mx-auto mt-4 max-w-[460px] text-sm font-medium leading-7 text-[#667085] lg:mx-0 lg:max-w-[360px]">
              Find quick, clear answers to common questions about discovering
              services and connecting with local businesses.
            </p>

            <div className="mx-auto mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-[#4365D0] lg:justify-start">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Dynamic & updated regularly</span>
            </div>

            <div className="mx-auto mt-4 h-1 w-14 rounded-full bg-gradient-to-r from-[#292E78] to-[#4365D0] lg:mx-0" />
          </div>

          <div>
            {isPending ? (
              <FaqSkeleton />
            ) : isError ? (
              <div
                role="alert"
                className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 px-5 py-10 text-center shadow-sm"
              >
                <AlertCircle
                  className="h-8 w-8 text-red-500"
                  aria-hidden="true"
                />
                <p className="mt-3 font-semibold text-red-900">
                  Unable to load FAQs
                </p>
                <p className="mt-1 text-sm text-red-700">
                  {error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again."}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isFetching ? "Trying again..." : "Try again"}
                </button>
              </div>
            ) : faqItems.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-[#E4E8EE] bg-white px-5 py-10 text-center shadow-sm">
                <CircleHelp
                  className="h-8 w-8 text-[#667789]"
                  aria-hidden="true"
                />
                <p className="mt-3 font-semibold text-primary">
                  No FAQs available
                </p>
                <p className="mt-1 text-sm text-[#667789]">
                  Please check back later for answers to common questions.
                </p>
              </div>
            ) : (
              <div className="w-full space-y-3">
                {faqItems.length > 5 && (
                  <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search questions..."
                      className="h-11 w-full rounded-xl border border-[#E1E7EC] bg-white pl-11 pr-4 text-sm text-[#101828] placeholder-[#98A2B3] shadow-sm transition focus:border-[#4365D0] focus:outline-none focus:ring-2 focus:ring-[#4365D0]/10"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#667085] hover:text-primary"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}

                {filteredFaqs.length === 0 ? (
                  <div className="rounded-xl border border-[#E4E8EE] bg-white p-6 text-center text-sm text-[#667085]">
                    No questions found matching &ldquo;{searchQuery}&rdquo;.
                  </div>
                ) : (
                  visibleFaqs.map((faq, index) => {
                    const isOpen = openItem === faq._id;

                    return (
                      <div
                        key={faq._id}
                        className={`group overflow-hidden rounded-xl border bg-white transition-[border-color,box-shadow,transform] duration-300 ease-out ${
                          isOpen
                            ? "border-[#4365D0]/30 shadow-[0_14px_36px_rgba(41,46,120,0.11)]"
                            : "border-[#DFE5EA] shadow-[0_4px_14px_rgba(32,42,70,0.04)] hover:-translate-y-0.5 hover:border-[#4365D0]/25 hover:shadow-[0_12px_28px_rgba(32,42,70,0.09)]"
                        }`}
                      >
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={`faq-${faq._id}-answer`}
                          onClick={() =>
                            setOpenItem((current) =>
                              current === faq._id ? null : faq._id,
                            )
                          }
                          className="flex min-h-[72px] w-full items-center gap-3 px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4365D0] sm:gap-4 sm:px-5"
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-extrabold transition-colors duration-300 ${
                              isOpen
                                ? "bg-[#292E78] text-white"
                                : "bg-[#EEF2FF] text-[#4365D0] group-hover:bg-[#E5EBFF]"
                            }`}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span
                            className={`flex-1 text-[14px] font-bold leading-[1.45] transition-colors duration-300 sm:text-[15px] lg:text-base ${
                              isOpen
                                ? "text-[#292E78]"
                                : "text-[#475467] group-hover:text-[#292E78]"
                            }`}
                          >
                            {faq.question}
                          </span>
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition duration-300 ${
                              isOpen
                                ? "rotate-180 bg-[#292E78] text-white"
                                : "bg-[#F2F4F7] text-[#667085] group-hover:bg-[#EEF2FF] group-hover:text-[#4365D0]"
                            }`}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </span>
                        </button>

                        <div
                          id={`faq-${faq._id}-answer`}
                          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            isOpen
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="mx-4 border-t border-[#EAECF0] sm:mx-5">
                              <div
                                className="py-4 pl-11 pr-1 text-[13px] font-medium leading-7 text-[#667085] sm:pl-12 sm:text-sm [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                                dangerouslySetInnerHTML={{ __html: faq.answer }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {hasMore && !searchQuery.trim() && (
                  <div className="pt-3 text-center">
                    <button
                      type="button"
                      onClick={() => setShowAll((prev) => !prev)}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#4365D0]/20 bg-white px-5 py-2.5 text-xs font-bold text-[#4365D0] shadow-sm transition hover:border-[#4365D0] hover:bg-[#EEF2FF] hover:shadow-md"
                    >
                      {showAll ? (
                        <>
                          Show Less Questions
                          <ChevronDown className="h-4 w-4 rotate-180" />
                        </>
                      ) : (
                        <>
                          Show More Questions ({filteredFaqs.length - INITIAL_VISIBLE_COUNT} remaining)
                          <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Faq;
