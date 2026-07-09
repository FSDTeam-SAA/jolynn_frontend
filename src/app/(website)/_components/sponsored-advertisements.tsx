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
    image: "/assets/images/gallery-bg.png",
    href: "/contact",
  },
  {
    id: "city-service-board",
    title: "Title",
    description:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad m",
    image: "/assets/images/about-why-us.jpg",
    href: "/contact",
  },
  {
    id: "local-pros-feature",
    title: "Title",
    description:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad m",
    image: "/assets/images/gallery-bg.png",
    href: "/contact",
  },
  {
    id: "featured-contractor",
    title: "Title",
    description:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad m",
    image: "/assets/images/about-why-us.jpg",
    href: "/contact",
  },
];

const SponsoredAdvertisements = () => {
  return (
    <section className="bg-white px-5 py-12 sm:px-8 md:py-16 lg:py-[58px]">
      <div className="mx-auto w-full max-w-[990px]">
        <div className="mx-auto max-w-[650px] text-center">
          <h2 className="text-[24px] font-extrabold leading-tight text-[#292E78] sm:text-[28px]">
            Sponsored Advertisements
          </h2>
          <p className="mt-3 text-[10.5px] font-medium leading-[1.55] text-[#626C78] sm:text-[11px]">
            Thousands of homeowners trust our verified professionals for
            reliable, high-quality home services. From small repairs to major
            projects, we deliver dependable workmanship and exceptional customer
            care.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sponsoredAds.map((ad) => (
            <Link
              key={ad.id}
              href={ad.href}
              className="group relative block h-[182px] overflow-hidden rounded-[5px] bg-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292E78] focus-visible:ring-offset-2"
            >
              <Image
                src={ad.image}
                alt={ad.title}
                fill
                sizes="(min-width: 1024px) 240px, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/18 to-black/82" />
              <div className="absolute inset-0 flex flex-col justify-between p-3">
                <h3 className="text-[21px] font-extrabold leading-none text-white">
                  {ad.title}
                </h3>
                <p className="line-clamp-4 text-[11.5px] font-medium leading-[1.2] text-white">
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
