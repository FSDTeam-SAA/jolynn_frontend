"use client";

import {
  Bookmark,
  Globe2,
  Mail,
  Phone,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import BusinessGallery from "./business-gallery";
import BusinessOverview from "./business-overview";
import { businessProfile } from "./business-profile-data";
import BusinessReviews from "./business-reviews";
import BusinessServices from "./business-services";

type ProfileTab = "overview" | "services" | "gallery" | "reviews";

const tabs: { id: ProfileTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "services", label: "Services" },
  { id: "gallery", label: "Gallery" },
  { id: "reviews", label: "Reviews" },
];

const renderStars = (rating: number) =>
  Array.from({ length: 5 }).map((_, index) => (
    <Star
      key={index}
      className={`h-3.5 w-3.5 ${
        index < Math.round(rating)
          ? "fill-[#FFB800] text-[#FFB800]"
          : "text-[#D9DEE7]"
      }`}
    />
  ));

const ContactCard = () => (
  <aside className="rounded-[8px] border border-[#D9DEE7] bg-white px-4 py-5 shadow-[0_1px_2px_rgba(17,24,39,0.04)] lg:sticky lg:top-6">
    <h2 className="text-center text-[12px] font-extrabold text-[#111827]">
      Contact {businessProfile.name}
    </h2>

    <div className="mt-4 space-y-3">
      <Link
        href={`tel:${businessProfile.phone}`}
        className="flex h-10 items-center justify-center gap-2 rounded-[4px] bg-[#292D73] px-4 text-[12px] font-extrabold text-white transition hover:bg-[#20255F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73] focus-visible:ring-offset-2"
      >
        <Phone className="h-3.5 w-3.5" />
        {businessProfile.phone}
      </Link>

      <Link
        href={businessProfile.websiteUrl}
        className="flex h-10 items-center justify-center gap-2 rounded-[4px] border border-[#D9DEE7] bg-white px-4 text-[12px] font-extrabold text-[#111827] transition hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73] focus-visible:ring-offset-2"
      >
        <Globe2 className="h-3.5 w-3.5" />
        Visit Website
      </Link>

      <Link
        href={businessProfile.emailUrl}
        className="flex h-10 items-center justify-center gap-2 rounded-[4px] bg-[#292D73] px-4 text-[12px] font-extrabold text-white transition hover:bg-[#20255F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73] focus-visible:ring-offset-2"
      >
        <Mail className="h-3.5 w-3.5" />
        Email
      </Link>

      <Link
        href={businessProfile.reportUrl}
        className="flex h-10 items-center justify-center rounded-[4px] bg-[#9D9D9D] px-4 text-[12px] font-extrabold text-white transition hover:bg-[#858585] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#858585] focus-visible:ring-offset-2"
      >
        Report
      </Link>
    </div>

    <div className="mt-6 h-px bg-[#E5E7EB]" />
    <p className="mt-4 text-center text-[10px] font-medium text-[#98A2B3]">
      Typically responds within 2 hours
    </p>
  </aside>
);

const BusinessViewProfileContainer = () => {
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");

  const activeContent = {
    overview: <BusinessOverview overview={businessProfile.overview} />,
    services: <BusinessServices services={businessProfile.services} />,
    gallery: <BusinessGallery gallery={businessProfile.gallery} />,
    reviews: (
      <BusinessReviews
        summary={businessProfile.reviewsSummary}
        reviews={businessProfile.reviews}
      />
    ),
  }[activeTab];

  return (
    <main className="bg-[#F5F8F7]">
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="container max-w-[1240px] pb-0 pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-[28px] font-extrabold leading-tight text-[#111827] sm:text-[32px]">
                {businessProfile.name}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-[1px]">
                  {renderStars(businessProfile.rating)}
                </div>
                <span className="text-[12px] font-extrabold text-[#111827]">
                  {businessProfile.rating.toFixed(1)}
                </span>
                <span className="text-[11px] font-medium text-[#667085]">
                  ({businessProfile.reviewCount} reviews)
                </span>
                <span className="rounded-[3px] bg-[#DFEEEE] px-2 py-1 text-[11px] font-semibold text-[#426078]">
                  {businessProfile.category}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={businessProfile.saveUrl}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[6px] border border-[#315CFF] bg-white px-5 text-[13px] font-semibold text-[#315CFF] transition hover:bg-[#F2F5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315CFF]"
              >
                <Bookmark className="h-4 w-4" />
                Save
              </Link>
              <Link
                href={businessProfile.quoteUrl}
                className="inline-flex h-10 items-center justify-center rounded-[6px] bg-[#292D73] px-6 text-[13px] font-extrabold text-white transition hover:bg-[#20255F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73] focus-visible:ring-offset-2"
              >
                Get Quote
              </Link>
            </div>
          </div>

          <nav className="mt-6 flex gap-7 overflow-x-auto border-t border-[#E5E7EB] text-[13px] font-medium text-[#475467]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative h-11 shrink-0 transition hover:text-[#292D73] ${
                  activeTab === tab.id
                    ? "font-extrabold text-[#292D73]"
                    : "text-[#475467]"
                }`}
              >
                {tab.label}
                <span
                  className={`absolute bottom-0 left-0 h-px w-full bg-[#292D73] transition ${
                    activeTab === tab.id ? "opacity-100" : "opacity-0"
                  }`}
                />
              </button>
            ))}
          </nav>
        </div>
      </header>

      <section className="container max-w-[1240px] py-10 sm:py-12 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-5">
          <div>{activeContent}</div>
          <ContactCard />
        </div>
      </section>
    </main>
  );
};

export default BusinessViewProfileContainer;
