import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  MessageCircle,
  Star,
} from "lucide-react";
import Link from "next/link";
import BusinessSearchForm from "./business-search-form";

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

type ServicesSearchContainerProps = {
  initialService?: string;
  initialLocation?: string;
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
    reportUrl: "#",
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
    reportUrl: "#",
    whatsappUrl: "#",
    reviewUrl: "#",
  },
  {
    id: 3,
    name: "Anderson Electric Co.",
    category: "Electricians",
    rating: 4.9,
    reviews: 127,
    location: "Austin, TX",
    description:
      "Licensed master electricians serving the Austin metro area for over 15 years. We handle residential and commercial projects...",
    accentColor: "#4D2077",
    profileUrl: "/services/businesses/3",
    reportUrl: "#",
    whatsappUrl: "#",
    reviewUrl: "#",
  },
  {
    id: 4,
    name: "Rivera Plumbing & Drain",
    category: "Plumbers",
    rating: 4.8,
    reviews: 127,
    location: "Denver, CO",
    description:
      "Family-owned plumbing company serving Denver since 2009. We specialize in drain cleaning, water heater installation...",
    accentColor: "#176F39",
    profileUrl: "/services/businesses/4",
    reportUrl: "#",
    whatsappUrl: "#",
    reviewUrl: "#",
  },
  {
    id: 5,
    name: "Anderson Electric Co.",
    category: "Electricians",
    rating: 4.9,
    reviews: 127,
    location: "Austin, TX",
    description:
      "Licensed master electricians serving the Austin metro area for over 15 years. We handle residential and commercial projects...",
    accentColor: "#4D2077",
    profileUrl: "/services/businesses/5",
    reportUrl: "#",
    whatsappUrl: "#",
    reviewUrl: "#",
  },
  {
    id: 6,
    name: "Rivera Plumbing & Drain",
    category: "Plumbers",
    rating: 4.8,
    reviews: 127,
    location: "Denver, CO",
    description:
      "Family-owned plumbing company serving Denver since 2009. We specialize in drain cleaning, water heater installation...",
    accentColor: "#176F39",
    profileUrl: "/services/businesses/6",
    reportUrl: "#",
    whatsappUrl: "#",
    reviewUrl: "#",
  },
];

const filterFields = ["Category", "Minimum Rating", "Location", "Keywords"];

const matchesQuery = (
  business: Business,
  initialService = "",
  initialLocation = "",
) => {
  const service = initialService.trim().toLowerCase();
  const location = initialLocation.trim().toLowerCase();

  const serviceMatch =
    !service ||
    business.name.toLowerCase().includes(service) ||
    business.category.toLowerCase().includes(service) ||
    business.description.toLowerCase().includes(service);

  const locationMatch =
    !location || business.location.toLowerCase().includes(location);

  return serviceMatch && locationMatch;
};

const ServicesSearchContainer = ({
  initialService = "",
  initialLocation = "",
}: ServicesSearchContainerProps) => {
  const filteredBusinesses = businesses.filter((business) =>
    matchesQuery(business, initialService, initialLocation),
  );
  const visibleBusinesses =
    filteredBusinesses.length > 0 ? filteredBusinesses : businesses;

  return (
   <div className="mt-10 md:mt-14 lg:mt-16 xl:mt-24">
     <main className="min-h-screen bg-white">
      <section className="bg-[#DFF0EE] px-4 py-8 sm:px-6 lg:px-8">
        <div className="container">
          <BusinessSearchForm
            initialService={initialService}
            initialLocation={initialLocation}
          />
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 md:py-12 lg:px-8 lg:py-14">
        <div className="container max-w-[1160px]">
          <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="h-fit rounded-[8px] bg-white p-5 shadow-[0_8px_24px_rgba(30,45,75,0.13)] ring-1 ring-[#E8ECF2]">
              <h2 className="text-[16px] font-extrabold text-[#111827]">
                Filter Results
              </h2>

              <div className="mt-5 space-y-3">
                {filterFields.map((field) => (
                  <button
                    key={field}
                    type="button"
                    className="flex h-10 w-full items-center justify-between rounded-[5px] border border-[#B8C0CC] bg-white px-4 text-left text-[12px] font-medium text-[#8A8F99] transition hover:border-[#292D73] hover:text-[#292D73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73]"
                  >
                    {field}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="mt-5 h-11 w-full rounded-[5px] bg-[#292D73] text-[12px] font-extrabold text-white transition hover:bg-[#20255F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73] focus-visible:ring-offset-2"
              >
                Apply Filters
              </button>
              <Link
                href="/services"
                className="mt-3 flex h-10 w-full items-center justify-center rounded-[5px] bg-[#F1F1F1] text-[12px] font-extrabold text-[#292D73] transition hover:bg-[#E5E7EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73] focus-visible:ring-offset-2"
              >
                Reset
              </Link>
            </aside>

            <div>
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                {visibleBusinesses.map((business) => (
                  <article
                    key={business.id}
                    className="rounded-[8px] bg-white p-4 shadow-[0_8px_24px_rgba(30,45,75,0.14)] ring-1 ring-[#E8ECF2] transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(30,45,75,0.18)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className="h-[48px] w-[48px] shrink-0 rounded-full"
                          style={{ backgroundColor: business.accentColor }}
                          aria-hidden="true"
                        />

                        <div className="min-w-0">
                          <h3 className="truncate text-[17px] font-extrabold leading-tight text-[#292D73]">
                            {business.name}
                          </h3>
                          <span className="mt-1 inline-flex rounded-[3px] bg-[#DFEEEE] px-2 py-[2px] text-[10px] font-semibold leading-none text-[#426078]">
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

                    <div className="mt-3 flex items-center gap-1.5">
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

                    <p className="mt-1.5 min-h-[38px] text-[11px] font-medium leading-[1.35] text-[#667085]">
                      {business.description}
                    </p>

                    <div className="mt-4 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_36px] gap-1.5">
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

              <div className="mt-16 flex items-center justify-center gap-2">
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#B8C0CC] text-[#667085] transition hover:border-[#292D73] hover:text-[#292D73]"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`flex h-8 w-8 items-center justify-center rounded-[4px] border text-[12px] font-bold transition ${
                      page === 1
                        ? "border-[#292D73] bg-[#292D73] text-white"
                        : "border-[#B8C0CC] bg-white text-[#475467] hover:border-[#292D73] hover:text-[#292D73]"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <span className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#B8C0CC] text-[12px] font-bold text-[#475467]">
                  ...
                </span>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#B8C0CC] text-[12px] font-bold text-[#475467] transition hover:border-[#292D73] hover:text-[#292D73]"
                >
                  8
                </button>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#B8C0CC] text-[#667085] transition hover:border-[#292D73] hover:text-[#292D73]"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
   </div>
  );
};

export default ServicesSearchContainer;
