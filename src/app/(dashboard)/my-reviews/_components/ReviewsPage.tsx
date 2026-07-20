"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Search, Star, Trash2 } from "lucide-react";
import DeleteModal from "@/components/modals/delete-modal";

type Review = {
  id: number;
  rating: number;
  review: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
};

const initialReviews: Review[] = [
  {
    id: 1,
    rating: 5,
    review:
      "Found Anderson Electric through SideQuote and they had someone at my house the next morning. Transparent pricing and the work was spotless. This is exactly what local service directories should be.",
    name: "Sarah M.",
    role: "Homeowner",
    location: "Austin, TX",
    avatar: "/assets/images/review1.png",
  },
  {
    id: 2,
    rating: 5,
    review:
      "I manage 12 rental units and SideQuote is now my first stop when I need a contractor. The verified profiles and real reviews give me confidence I'm calling someone legitimate.",
    name: "Marcus T.",
    role: "Property Manager",
    location: "Denver, CO",
    avatar: "/assets/images/review2.png",
  },
  {
    id: 3,
    rating: 5,
    review:
      "Creating my profile took under 20 minutes. Within a week I had three new customers who found me through the directory. The SideQuote email address is a great professional touch.",
    name: "Linda C.",
    role: "Small Business Owner",
    location: "Phoenix, AZ",
    avatar: "/assets/images/review3.png",
  },
  {
    id: 4,
    rating: 5,
    review:
      "Found Anderson Electric through SideQuote and they had someone at my house the next morning. Transparent pricing and the work was spotless. This is exactly what local service directories should be.",
    name: "Sarah M.",
    role: "Homeowner",
    location: "Austin, TX",
    avatar: "/assets/images/review1.png",
  },
  {
    id: 5,
    rating: 5,
    review:
      "I manage 12 rental units and SideQuote is now my first stop when I need a contractor. The verified profiles and real reviews give me confidence I'm calling someone legitimate.",
    name: "Marcus T.",
    role: "Property Manager",
    location: "Denver, CO",
    avatar: "/assets/images/review2.png",
  },
  {
    id: 6,
    rating: 5,
    review:
      "Creating my profile took under 20 minutes. Within a week I had three new customers who found me through the directory. The SideQuote email address is a great professional touch.",
    name: "Linda C.",
    role: "Small Business Owner",
    location: "Phoenix, AZ",
    avatar: "/assets/images/review3.png",
  },
];

function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [search, setSearch] = useState("");
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return reviews;

    return reviews.filter((review) =>
      [review.name, review.role, review.location, review.review].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [reviews, search]);

  const deleteReview = () => {
    if (!reviewToDelete) return;
    setReviews((current) =>
      current.filter((review) => review.id !== reviewToDelete.id),
    );
    setReviewToDelete(null);
  };

  return (
    <>
      <section>
      <label className="relative mb-5 block w-full sm:max-w-[340px]">
        <span className="sr-only">Search reviews</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search..."
          className="h-[36px] w-full rounded-[8px] border-0 bg-[#EAECED] pl-9 pr-4 text-xs text-[#344054] outline-none placeholder:text-[#667085] focus:ring-2 focus:ring-[#30347F]/20"
        />
      </label>

      {filteredReviews.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredReviews.map((review) => (
            <article
              key={review.id}
              className="relative flex min-h-[210px] flex-col rounded-[8px] bg-white px-5 py-5"
            >
              <button
                type="button"
                aria-label={`Delete review from ${review.name}`}
                onClick={() => setReviewToDelete(review)}
                className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#FFF0EF] text-[#FF4D4F] transition-colors hover:bg-[#FFD9D6]"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <div
                className="flex items-center gap-0.5 pr-11"
                aria-label={`${review.rating} out of 5 stars`}
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    className={`h-4 w-4 ${
                      index < review.rating
                        ? "fill-[#FFB000] text-[#FFB000]"
                        : "fill-[#E4E7EC] text-[#E4E7EC]"
                    }`}
                  />
                ))}
              </div>

              <p className="mt-3 flex-1 text-[13px] leading-[1.6] text-[#41444A]">
                “{review.review}”
              </p>

              <div className="mt-3 flex items-center gap-2">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#EAECF0]">
                  <Image
                    src={review.avatar}
                    alt={review.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-[#30347F]">
                    {review.name}
                  </h2>
                  <p className="truncate text-[11px] text-[#7A8190]">
                    {review.role} · {review.location}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[8px] bg-white px-6 py-14 text-center text-sm text-[#667085]">
          No reviews found.
        </div>
      )}
      </section>

      <DeleteModal
        isOpen={Boolean(reviewToDelete)}
        onClose={() => setReviewToDelete(null)}
        onConfirm={deleteReview}
        title="Delete Review?"
        desc={`Are you sure you want to delete ${reviewToDelete?.name || "this user's"} review?`}
      />
    </>
  );
}

export default ReviewsPage;
