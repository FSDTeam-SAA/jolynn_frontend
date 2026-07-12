"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const faqItems: FaqItem[] = [
  {
    id: "free-for-customers",
    question: "Is SideQuote free for customers?",
    answer:
      "Yes. Customers can search, compare, and connect with listed service providers for free.",
  },
  {
    id: "business-verification",
    question: "How does business verification work?",
    answer:
      "Businesses are reviewed for basic profile details, service information, and contact accuracy before being shown to customers.",
  },
  {
    id: "leave-review",
    question: "Can I leave a review for any business?",
    answer:
      "You can leave a review after interacting with a business listed on SideQuote, helping future customers choose with confidence.",
  },
  {
    id: "business-listed",
    question: "How do I get my business listed?",
    answer:
      "Use the get listed flow or contact the SideQuote team with your business details, service area, and category information.",
  },
  {
    id: "business-types",
    question: "What types of businesses can list on SideQuote?",
    answer:
      "Local service businesses such as electricians, plumbers, HVAC technicians, roofers, and similar trade professionals can list on SideQuote.",
  },
];

const Faq = () => {
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <section id="faq" className="bg-white px-5 py-12 sm:px-8 md:py-16 lg:py-[50px]">
      <div className="container">
        <h2 className="text-2xl md:text-[28px] lg:text-[32px] font-bold leading-normal text-primary text-center">
          Most Frequently Asked Questions
        </h2>

        <div className="mt-8 w-full sm:mt-9">
          {faqItems.map((faq) => (
            <div
              key={faq.id}
              className="border-b border-[#E4E8EE]"
            >
              <button
                type="button"
                aria-expanded={openItem === faq.id}
                aria-controls={`${faq.id}-answer`}
                onClick={() =>
                  setOpenItem((current) =>
                    current === faq.id ? null : faq.id
                  )
                }
                className="flex min-h-[40px] w-full items-center justify-between py-0 pl-0 pr-2 text-left text-[13.5px] font-semibold leading-snug text-[#667789] transition-colors hover:text-[#292E78] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292E78] focus-visible:ring-offset-2 sm:min-h-[43px]"
              >
                <span className="pr-5">{faq.question}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[#667789] transition-transform duration-200 ${
                    openItem === faq.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                id={`${faq.id}-answer`}
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  openItem === faq.id ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="pb-4 pr-10 pt-0 text-[13px] leading-[1.7] text-[#667789] sm:text-sm">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;
