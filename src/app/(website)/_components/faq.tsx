"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ChevronDown, CircleHelp } from "lucide-react";
import { useState } from "react";

type FaqItem = {
  _id: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
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

const fetchFaqs = async (): Promise<FaqResponse> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("The FAQ service is not configured.");
  }

  const response = await fetch(
    `${apiUrl}/faq?sortBy=createdAt&limit=10&page=1`,
    { headers: { Accept: "*/*" } }
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
    className="mt-8 w-full sm:mt-9"
    aria-label="Loading frequently asked questions"
  >
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className="flex min-h-[43px] items-center justify-between border-b border-[#E4E8EE] pr-2"
      >
        <Skeleton className={`h-4 ${index % 2 === 0 ? "w-2/3" : "w-1/2"}`} />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
    ))}
  </div>
);

const Faq = () => {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const { data, isPending, isError, error, refetch, isFetching } =
    useQuery<FaqResponse>({
      queryKey: ["website-faqs"],
      queryFn: fetchFaqs,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    });

  const faqItems = data?.data ?? [];

  return (
    <section
      id="faq"
      className="bg-white px-5 py-12 sm:px-8 md:py-16 lg:py-[50px]"
    >
      <div className="container">
        <h2 className="text-2xl md:text-[28px] lg:text-[32px] font-bold leading-normal text-primary text-center">
          Most Frequently Asked Questions
        </h2>

        {isPending ? (
          <FaqSkeleton />
        ) : isError ? (
          <div
            role="alert"
            className="mt-8 flex flex-col items-center rounded-xl border border-red-200 bg-red-50 px-5 py-8 text-center sm:mt-9"
          >
            <AlertCircle className="h-8 w-8 text-red-500" aria-hidden="true" />
            <p className="mt-3 font-semibold text-red-900">Unable to load FAQs</p>
            <p className="mt-1 text-sm text-red-700">
              {error instanceof Error
                ? error.message
                : "Something went wrong. Please try again."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isFetching ? "Trying again..." : "Try again"}
            </button>
          </div>
        ) : faqItems.length === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-xl border border-[#E4E8EE] bg-slate-50 px-5 py-8 text-center sm:mt-9">
            <CircleHelp className="h-8 w-8 text-[#667789]" aria-hidden="true" />
            <p className="mt-3 font-semibold text-primary">No FAQs available</p>
            <p className="mt-1 text-sm text-[#667789]">
              Please check back later for answers to common questions.
            </p>
          </div>
        ) : (
          <div className="mt-8 w-full sm:mt-9">
            {faqItems.map((faq) => (
              <div key={faq._id} className="border-b border-[#E4E8EE]">
                <button
                  type="button"
                  aria-expanded={openItem === faq._id}
                  aria-controls={`faq-${faq._id}-answer`}
                  onClick={() =>
                    setOpenItem((current) =>
                      current === faq._id ? null : faq._id,
                    )
                  }
                  className="flex min-h-[40px] w-full items-center justify-between py-0 pl-0 pr-2 text-left text-[13.5px] lg:text-base font-semibold leading-snug text-[#667789] transition-colors hover:text-[#292E78] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292E78] focus-visible:ring-offset-2 sm:min-h-[43px]"
                >
                  <span className="pr-5">{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#667789] transition-transform duration-200 ${
                      openItem === faq._id ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  id={`faq-${faq._id}-answer`}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    openItem === faq._id
                      ? "grid-rows-[1fr]"
                      : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-4 pr-10 pt-0 text-[13px] lg:text-sm leading-[1.7] text-[#667789] sm:text-sm">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Faq;
