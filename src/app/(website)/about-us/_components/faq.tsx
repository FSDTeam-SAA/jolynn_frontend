"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import ErrorContainer from "@/components/shared/ErrorContainer/ErrorContainer";
import TableSkeletonWrapper from "@/components/shared/TableSkeletonWrapper/TableSkeletonWrapper";

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface FAQPagination {
  currentPage: number;
  totalPages: number;
  totalFAQs: number;
  itemsPerPage: number;
}

export interface FAQResponse {
  status: boolean;
  message: string;
  data: FAQ[];
  pagination: FAQPagination;
}

const FaqContainer = () => {
  const { data, isLoading, isError, error } = useQuery<FAQResponse>({
    queryKey: ["faqs"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/faqs`);
      return res.json();
    },
  });

  console.log(data);

  if (isLoading)
    return (
      <div className="w-full container p-10">
        <TableSkeletonWrapper
          count={5}
          width="100%"
          height="80px"
          className="bg-white"
        />
      </div>
    );
  if (isError)
    return (
      <ErrorContainer message={error?.message || "Something went wrong"} />
    );
  return (
    <div className="pb-10 md:pb-16 lg:pb-24 bg-white">
      <div className="container pt-3 md:pt-5">
        <div>
          <h2 className="text-2xl md:text-[28px] lg:text-[32px] text-[#202020] leading-[150%] font-semibold text-center">
            Frequently Asked Questions
          </h2>
          <p className="text-sm md:text-base text-[#505050] text-center pt-2 leading-[150%] font-normal">
            Find answers to common questions about our treatments.
          </p>
        </div>
        {/* FAQ Accordion */}
        <div className="space-y-0 pt-6 md:pt-8 lg:pt-10">
          <Accordion type="single" collapsible className="w-full">
            {data?.data?.map((faq) => (
              <AccordionItem
                key={faq._id}
                value={faq._id}
                className="bg-[#F1F1F1] border border-[#D5D5D5] mb-4 rounded-[6px]"
              >
                <AccordionTrigger className="px-6 py-[14px] text-left hover:no-underline hover:bg-gray-50 transition-colors [&[data-state=open]>svg]:rotate-180">
                  <div className="flex items-start gap-3 text-left">
                    <span className="text-lg md:text-xl font-medium text-primary leading-[120%]">
                      {faq?.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-[15px] py-3 bg-white">
                  <div dangerouslySetInnerHTML={{ __html: faq?.answer }} className="text-[#343A40] text-base font-normal leading-[150%]"/>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default FaqContainer;
