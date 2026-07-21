import { Star } from "lucide-react";
import Image from "next/image";

type Review = {
  id: number;
  name: string;
  role: string;
  location: string;
  avatar: string;
  rating: number;
  quote: string;
  featured?: boolean;
};

const reviews: Review[] = [
  {
    id: 1,
    name: "Sarah M.",
    role: "Homeowner",
    location: "Austin, TX",
    avatar: "/assets/images/review1.png",
    rating: 5,
    quote:
      "Found Anderson Electric through SideQuote and they had someone at my house the next morning. Transparent pricing and the work was spotless. This is exactly what local service directories should be.",
  },
  {
    id: 2,
    name: "Marcus T.",
    role: "Property Manager",
    location: "Denver, CO",
    avatar: "/assets/images/review2.png",
    rating: 5,
    quote:
      "I manage 12 rental units and SideQuote is now my first stop when I need a contractor. The verified profiles and real reviews give me confidence I'm calling someone legitimate.",
    featured: true,
  },
  {
    id: 3,
    name: "Linda C.",
    role: "Small Business Owner",
    location: "Phoenix, AZ",
    avatar: "/assets/images/review3.png",
    rating: 5,
    quote:
      "Creating my profile took under 20 minutes. Within a week I had three new customers who found me through the directory. The SideQuote email address is a great professional touch.",
  },
  {
    id: 4,
    name: "Sarah M.",
    role: "Homeowner",
    location: "Austin, TX",
    avatar: "/assets/images/review1.png",
    rating: 5,
    quote:
      "Found Anderson Electric through SideQuote and they had someone at my house the next morning. Transparent pricing and the work was spotless. This is exactly what local service directories should be.",
  },
  {
    id: 5,
    name: "Marcus T.",
    role: "Property Manager",
    location: "Denver, CO",
    avatar: "/assets/images/review2.png",
    rating: 5,
    quote:
      "I manage 12 rental units and SideQuote is now my first stop when I need a contractor. The verified profiles and real reviews give me confidence I'm calling someone legitimate.",
    featured: true,
  },
  {
    id: 6,
    name: "Linda C.",
    role: "Small Business Owner",
    location: "Phoenix, AZ",
    avatar: "/assets/images/review3.png",
    rating: 5,
    quote:
      "Creating my profile took under 20 minutes. Within a week I had three new customers who found me through the directory. The SideQuote email address is a great professional touch.",
  },
  {
    id: 7,
    name: "Sarah M.",
    role: "Homeowner",
    location: "Austin, TX",
    avatar: "/assets/images/review1.png",
    rating: 5,
    quote:
      "Found Anderson Electric through SideQuote and they had someone at my house the next morning. Transparent pricing and the work was spotless. This is exactly what local service directories should be.",
  },
  {
    id: 8,
    name: "Marcus T.",
    role: "Property Manager",
    location: "Denver, CO",
    avatar: "/assets/images/review2.png",
    rating: 5,
    quote:
      "I manage 12 rental units and SideQuote is now my first stop when I need a contractor. The verified profiles and real reviews give me confidence I'm calling someone legitimate.",
    featured: true,
  },
  {
    id: 9,
    name: "Linda C.",
    role: "Small Business Owner",
    location: "Phoenix, AZ",
    avatar: "/assets/images/review3.png",
    rating: 5,
    quote:
      "Creating my profile took under 20 minutes. Within a week I had three new customers who found me through the directory. The SideQuote email address is a great professional touch.",
  },
  {
    id: 10,
    name: "Sarah M.",
    role: "Homeowner",
    location: "Austin, TX",
    avatar: "/assets/images/review1.png",
    rating: 5,
    quote:
      "Found Anderson Electric through SideQuote and they had someone at my house the next morning. Transparent pricing and the work was spotless. This is exactly what local service directories should be.",
  },
  {
    id: 11,
    name: "Marcus T.",
    role: "Property Manager",
    location: "Denver, CO",
    avatar: "/assets/images/review2.png",
    rating: 5,
    quote:
      "I manage 12 rental units and SideQuote is now my first stop when I need a contractor. The verified profiles and real reviews give me confidence I'm calling someone legitimate.",
    featured: true,
  },
  {
    id: 12,
    name: "Linda C.",
    role: "Small Business Owner",
    location: "Phoenix, AZ",
    avatar: "/assets/images/review3.png",
    rating: 5,
    quote:
      "Creating my profile took under 20 minutes. Within a week I had three new customers who found me through the directory. The SideQuote email address is a great professional touch.",
  },
];

const ReviewContainer = () => {
  return (
    <section className="bg-white px-4 py-12 sm:px-6 md:py-16 lg:px-8 lg:py-20 xl:py-24">
      <div className="container">
        <div className="mx-auto max-w-[520px] text-center">
          <h2 className="text-[28px] font-extrabold leading-tight text-[#292D73] sm:text-[32px] lg:text-[36px]">
            What Our Users Say
          </h2>
          <p className="mx-auto mt-3 max-w-[430px] text-[12px] font-medium leading-[1.45] text-[#4B5563] sm:text-[13px]">
            Real stories from satisfied customers who found trusted
            professionals and enjoyed quality service from start to finish.
          </p>
        </div>

        <div className="mx-auto mt-9 grid max-w-[1080px] grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-11 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-10">
          {reviews.map((review) => (
            <article
              key={review.id}
              className={`flex min-h-[190px] flex-col rounded-[7px] px-4 pb-4 pt-3.5 shadow-[0_7px_16px_rgba(30,45,75,0.16)] transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_14px_26px_rgba(30,45,75,0.2)] motion-reduce:transform-none motion-reduce:transition-none sm:px-4 ${
                review.featured
                  ? "border border-[#315CFF] bg-white"
                  : "border border-[#D9F0F1] bg-[#F0FEFE]"
              }`}
            >
              <div className="flex items-center gap-[2px]" aria-label={`${review.rating} out of 5 stars`}>
                {Array.from({ length: review.rating }).map((_, index) => (
                  <Star
                    key={index}
                    className="h-3.5 w-3.5 fill-[#FFB800] text-[#FFB800]"
                  />
                ))}
              </div>

              <p className="mt-3 flex-1 text-[12px] font-medium leading-[1.45] text-[#273142]">
                &ldquo;{review.quote}&rdquo;
              </p>

              <div className="mb-3 mt-4 h-px bg-[#A7DDE4]" />

              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-white">
                  <Image
                    src={review.avatar}
                    alt={`${review.name} avatar`}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-[13px] font-extrabold leading-tight text-[#292D73]">
                    {review.name}
                  </h3>
                  <p className="mt-1 truncate text-[10px] font-medium leading-tight text-[#667085]">
                    {review.role} · {review.location}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewContainer;
