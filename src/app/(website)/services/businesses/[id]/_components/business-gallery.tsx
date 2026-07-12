import Image from "next/image";
import type { BusinessProfile } from "./business-profile-data";

type BusinessGalleryProps = {
  gallery: BusinessProfile["gallery"];
};

const BusinessGallery = ({ gallery }: BusinessGalleryProps) => {
  return (
    <article className="rounded-[8px] border border-[#E1E7EC] bg-white px-4 py-5 shadow-[0_6px_14px_rgba(17,24,39,0.08)] sm:px-5">
      <h2 className="text-[20px] font-extrabold leading-tight text-[#292D73]">
        Project Gallery
      </h2>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.map((item) => (
          <div
            key={item.id}
            className="relative aspect-[2/1.05] overflow-hidden rounded-[5px] bg-[#EAF2F7]"
          >
            <Image
              src={item.image}
              alt={item.alt}
              fill
              sizes="(min-width: 1024px) 260px, (min-width: 640px) 45vw, 100vw"
              className="object-cover transition duration-300 hover:scale-105"
            />
          </div>
        ))}
      </div>
    </article>
  );
};

export default BusinessGallery;
