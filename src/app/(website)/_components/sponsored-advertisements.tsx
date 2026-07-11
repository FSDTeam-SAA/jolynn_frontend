import Image from "next/image";
import Link from "next/link";

type SponsoredAd = {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
};

const sponsoredAds: SponsoredAd[] = [
  {
    id: "trusted-home-repairs",
    title: "Title",
    description:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad m",
    image: "/assets/images/sponsor1.png",
    href: "/contact",
  },
  {
    id: "city-service-board",
    title: "Title",
    description:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad m",
    image: "/assets/images/sponsor2.jpg",
    href: "/contact",
  },
  {
    id: "local-pros-feature",
    title: "Title",
    description:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad m",
    image: "/assets/images/sponsor1.png",
    href: "/contact",
  },
  {
    id: "featured-contractor",
    title: "Title",
    description:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad m",
    image: "/assets/images/sponsor2.jpg",
    href: "/contact",
  },
];

const SponsoredAdvertisements = () => {
  return (
    <section className="bg-white px-5 py-12 sm:px-8 md:py-16 lg:py-[58px]">
      <div className="container">
        <div className=" text-center">
          <h2 className="text-2xl md:text-[28px] lg:text-[32px] font-bold leading-normal text-primary">
            Sponsored Advertisements
          </h2>
          <p className="mt-2 text-xs md:text-sm font-normal leading-normal text-[#444444]">
            Thousands of homeowners trust our verified professionals for
            reliable, high-quality home services. From small repairs to major <br className="hidden md:block"/>
            projects, we deliver dependable workmanship and exceptional customer
            care.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sponsoredAds.map((ad) => (
            <Link
              key={ad.id}
              href={ad.href}
              className="group relative block overflow-hidden rounded-[5px] bg-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292E78] focus-visible:ring-offset-2"
            >
              <Image
                src={ad.image}
                alt={ad.title}
                width={400}
                height={400}
                className="w-full h-[280px] object-cover"
                // className="absolute inset-0 h-[352px] w-full object-cover transition duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/18 to-black/82" />
              <div className="absolute inset-0 flex flex-col justify-between p-3">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold leading-normal text-white">
                  {ad.title}
                </h3>
                <p className="line-clamp-4 text-xs md:text-sm font-normal leading-normal text-white">
                  {ad.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SponsoredAdvertisements;
