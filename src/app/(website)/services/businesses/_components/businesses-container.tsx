import { MapPin, MessageCircle, Star } from "lucide-react";
import Link from "next/link";

type Business = {
  id: number;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  location: string;
  description: string;
  accentColor: string;
  profileUrl: string;
  reportUrl: string;
  whatsappUrl: string;
  reviewUrl: string;
};

const businesses: Business[] = [
  {
    id: 1,
    name: "Anderson Electric Co.",
    category: "Electricians",
    rating: 4.9,
    reviews: 127,
    location: "Austin, TX",
    description:
      "Licensed master electricians serving the Austin metro area for over 15 years. We handle residential and commercial projects...",
    accentColor: "#4D2077",
    profileUrl: "/services/businesses/1",
    reportUrl: "/report",
    whatsappUrl: "#",
    reviewUrl: "#",
  },
  {
    id: 2,
    name: "Rivera Plumbing & Drain",
    category: "Plumbers",
    rating: 4.8,
    reviews: 127,
    location: "Denver, CO",
    description:
      "Family-owned plumbing company serving Denver since 2009. We specialize in drain cleaning, water heater installation...",
    accentColor: "#176F39",
    profileUrl: "/services/businesses/2",
    reportUrl: "/report",
    whatsappUrl: "#",
    reviewUrl: "#",
  },
  {
    id: 3,
    name: "Peak Roofing Solutions",
    category: "Roofers",
    rating: 4.7,
    reviews: 127,
    location: "Phoenix, AZ",
    description:
      "Full-service roofing contractor specializing in residential replacements, storm damage repair, and commercial flat ...",
    accentColor: "#741D1D",
    profileUrl: "/services/businesses/3",
    reportUrl: "/report",
    whatsappUrl: "#",
    reviewUrl: "#",
  },
  {
    id: 4,
    name: "Anderson Electric Co.",
    category: "Electricians",
    rating: 4.9,
    reviews: 127,
    location: "Austin, TX",
    description:
      "Licensed master electricians serving the Austin metro area for over 15 years. We handle residential and commercial projects...",
    accentColor: "#4D2077",
    profileUrl: "/services/businesses/4",
    reportUrl: "/report",
    whatsappUrl: "#",
    reviewUrl: "#",
  },
  {
    id: 5,
    name: "Rivera Plumbing & Drain",
    category: "Plumbers",
    rating: 4.8,
    reviews: 127,
    location: "Denver, CO",
    description:
      "Family-owned plumbing company serving Denver since 2009. We specialize in drain cleaning, water heater installation...",
    accentColor: "#176F39",
    profileUrl: "/services/businesses/5",
    reportUrl: "/report",
    whatsappUrl: "#",
    reviewUrl: "#",
  },
  {
    id: 6,
    name: "Peak Roofing Solutions",
    category: "Roofers",
    rating: 4.7,
    reviews: 127,
    location: "Phoenix, AZ",
    description:
      "Full-service roofing contractor specializing in residential replacements, storm damage repair, and commercial flat ...",
    accentColor: "#741D1D",
    profileUrl: "/services/businesses/6",
    reportUrl: "/report",
    whatsappUrl: "#",
    reviewUrl: "#",
  },
  {
    id: 7,
    name: "Anderson Electric Co.",
    category: "Electricians",
    rating: 4.9,
    reviews: 127,
    location: "Austin, TX",
    description:
      "Licensed master electricians serving the Austin metro area for over 15 years. We handle residential and commercial projects...",
    accentColor: "#4D2077",
    profileUrl: "/services/businesses/7",
    reportUrl: "/report",
    whatsappUrl: "#",
    reviewUrl: "#",
  },
  {
    id: 8,
    name: "Rivera Plumbing & Drain",
    category: "Plumbers",
    rating: 4.8,
    reviews: 127,
    location: "Denver, CO",
    description:
      "Family-owned plumbing company serving Denver since 2009. We specialize in drain cleaning, water heater installation...",
    accentColor: "#176F39",
    profileUrl: "/services/businesses/8",
    reportUrl: "/report",
    whatsappUrl: "#",
    reviewUrl: "#",
  },
  {
    id: 9,
    name: "Peak Roofing Solutions",
    category: "Roofers",
    rating: 4.7,
    reviews: 127,
    location: "Phoenix, AZ",
    description:
      "Full-service roofing contractor specializing in residential replacements, storm damage repair, and commercial flat ...",
    accentColor: "#741D1D",
    profileUrl: "/services/businesses/9",
    reportUrl: "/report",
    whatsappUrl: "#",
    reviewUrl: "#",
  },
];

const BusinessesContainer = () => {
  return (
    <section className="min-h-screen bg-[#DFF0EE] px-4 py-12 sm:px-6 md:py-16 lg:px-8 lg:py-[86px]">
      <div className="container max-w-[1370px]">
        <div className="text-center">
          <h1 className="text-[26px] font-extrabold leading-tight text-[#292E78] sm:text-[30px] md:text-[34px]">
            Featured Businesses
          </h1>
          <p className="mt-2 text-[12px] font-medium text-[#30343F] sm:text-[13px]">
            Choose a service to get started
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-[21px] xl:mt-[34px]">
          {businesses.map((business) => (
            <article
              key={business.id}
              className="rounded-[7px] bg-white px-4 pb-4 pt-3.5 shadow-[0_1px_2px_rgba(32,42,70,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(32,42,70,0.12)] sm:px-[15px] sm:pb-[14px]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2.5">
                  <div
                    className="mt-0.5 h-[42px] w-[42px] shrink-0 rounded-full sm:h-[47px] sm:w-[47px]"
                    style={{ backgroundColor: business.accentColor }}
                    aria-hidden="true"
                  />

                  <div className="min-w-0">
                    <h2 className="truncate text-[15px] font-extrabold leading-tight text-[#292E78] sm:text-[17px]">
                      {business.name}
                    </h2>
                    <span className="mt-1 inline-flex rounded-[3px] bg-[#DFEEEE] px-1.5 py-[2px] text-[10px] font-semibold leading-none text-[#426078]">
                      {business.category}
                    </span>
                  </div>
                </div>

                <Link
                  href={business.reviewUrl}
                  className="inline-flex h-9 shrink-0 items-center justify-center rounded-[5px] border border-[#F8AA18] bg-[#FFF6D8] px-5 text-[11px] font-medium text-[#E56D00] transition hover:bg-[#F8AA18] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F8AA18] focus-visible:ring-offset-2"
                >
                  Review
                </Link>
              </div>

              <div className="mt-[14px] flex items-center gap-1.5">
                <div
                  className="flex items-center gap-[1px]"
                  aria-label={`${business.rating} out of 5 stars`}
                >
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className="h-[13px] w-[13px] fill-[#FFB800] text-[#FFB800]"
                    />
                  ))}
                </div>
                <span className="text-[11px] font-bold text-[#292E78]">
                  {business.rating.toFixed(1)}
                </span>
                <span className="text-[11px] font-medium text-[#667085]">
                  ({business.reviews} reviews)
                </span>
              </div>

              <div className="mt-3 flex items-center gap-1 text-[10.5px] font-medium text-[#667085]">
                <MapPin className="h-3.5 w-3.5 text-[#667085]" />
                <span>{business.location}</span>
              </div>

              <p className="mt-1.5 min-h-[38px] text-[10.5px] font-medium leading-[1.35] text-[#667085] sm:text-[11px]">
                {business.description}
              </p>

              <div className="mt-4 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_34px] gap-1.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_40px]">
                <Link
                  href={business.profileUrl}
                  aria-label={`View ${business.name} profile`}
                  className="inline-flex h-[36px] items-center justify-center rounded-[5px] bg-[#292E78] px-3 text-[11px] font-bold text-white transition hover:bg-[#1F2464] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292E78] focus-visible:ring-offset-2"
                >
                  View Profile
                </Link>
                <Link
                  href={business.reportUrl}
                  className="inline-flex h-[36px] items-center justify-center rounded-[5px] bg-[#A7A7A7] px-3 text-[11px] font-bold text-white transition hover:bg-[#8E8E8E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E8E8E] focus-visible:ring-offset-2"
                >
                  Report
                </Link>
                <Link
                  href={business.whatsappUrl}
                  className="inline-flex h-[36px] items-center justify-center rounded-[5px] border border-[#292E78] bg-white text-[#292E78] transition hover:bg-[#292E78] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292E78] focus-visible:ring-offset-2"
                  aria-label={`Message ${business.name}`}
                >
                  <MessageCircle className="h-[17px] w-[17px]" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BusinessesContainer;
