"use client";

import { Star, BadgeCheck } from "lucide-react";
import Image from "next/image";
import type { BusinessProfile } from "./business-profile-data";

type BusinessReviewsProps = {
  summary: BusinessProfile["reviewsSummary"];
  reviews: BusinessProfile["reviews"];
};

const renderStars = (rating: number, className = "h-4 w-4") =>
  Array.from({ length: 5 }).map((_, index) => (
    <Star
      key={index}
      className={`${className} ${
        index < rating ? "fill-[#FFB800] text-[#FFB800]" : "text-[#D9DEE7]"
      }`}
    />
  ));

const BusinessReviews = ({ summary, reviews }: BusinessReviewsProps) => {
  return (
    <div className="space-y-5">
      <article className="rounded-[8px] border border-[#E1E7EC] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(17,24,39,0.03)]">
        <div className="grid gap-5 sm:grid-cols-[90px_minmax(0,1fr)] sm:items-center">
          <div>
            <p className="text-[34px] font-extrabold leading-none text-[#292D73]">
              {summary.rating.toFixed(1)}
            </p>
            <div className="mt-3 flex items-center gap-[1px]">
              {renderStars(Math.round(summary.rating), "h-3.5 w-3.5")}
            </div>
            <p className="mt-1 text-[11px] font-medium text-[#667085]">
              {summary.totalReviews} reviews
            </p>
          </div>

          <div className="space-y-2">
            {summary.distribution.map((item) => (
              <div
                key={item.stars}
                className="grid grid-cols-[18px_12px_minmax(0,1fr)_32px] items-center gap-2 text-[11px] font-medium text-[#667085]"
              >
                <span>{item.stars}</span>
                <Star className="h-3 w-3 fill-[#FFB800] text-[#FFB800]" />
                <div className="h-1.5 overflow-hidden rounded-full bg-[#E2E8F0]">
                  <div
                    className="h-full rounded-full bg-[#5367E8]"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
                <span className="text-right">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </article>

      <div className="space-y-5">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="rounded-[8px] border border-[#E1E7EC] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(17,24,39,0.03)] sm:px-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={review.avatar}
                    alt={`${review.name} avatar`}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="truncate text-[14px] font-extrabold leading-tight text-[#292D73]">
                      {review.name}
                    </h3>
                    <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[#4E67D8]" />
                  </div>
                  <p className="mt-0.5 text-[10px] font-medium text-[#667085]">
                    {review.date}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-[1px]">
                {renderStars(review.rating, "h-3.5 w-3.5")}
              </div>
            </div>

            <p className="mt-3 text-[13px] font-medium leading-[1.45] text-[#172033]">
              {review.comment}
            </p>
          </article>
        ))}
      </div>

      <article className="rounded-[8px] border border-[#E1E7EC] bg-white px-4 py-5 shadow-[0_1px_2px_rgba(17,24,39,0.03)] sm:px-5">
        <h2 className="text-[20px] font-extrabold leading-tight text-[#292D73]">
          Write a review
        </h2>
        <div className="mt-3 flex items-center gap-1">
          {renderStars(5, "h-6 w-6")}
        </div>

        <textarea
          className="mt-4 min-h-[126px] w-full resize-none rounded-[5px] border border-[#B8C0CC] px-4 py-3 text-[13px] font-medium text-[#111827] outline-none transition placeholder:text-[#999999] focus:border-[#292D73] focus:ring-2 focus:ring-[#292D73]/15"
          placeholder="Oh my man this is incredible, I never get a service as fast as like this..."
        />

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            className="h-9 rounded-[6px] border border-[#8290A3] bg-white px-5 text-[13px] font-medium text-[#344054] transition hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73]"
          >
            Cancel
          </button>
          <button
            type="button"
            className="h-9 rounded-[6px] bg-[#292D73] px-6 text-[13px] font-bold text-white transition hover:bg-[#20255F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73] focus-visible:ring-offset-2"
          >
            Submit
          </button>
        </div>
      </article>
    </div>
  );
};

export default BusinessReviews;
