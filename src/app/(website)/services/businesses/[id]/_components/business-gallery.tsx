"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useBusinessGallery } from "@/hooks/use-business-profile-sections";
import Image from "next/image";

type BusinessGalleryProps = {
  businessId: string;
};

const BusinessGallery = ({ businessId }: BusinessGalleryProps) => {
  const { data, isPending, isError } = useBusinessGallery(businessId);
  const gallery = (data?.data ?? []).flatMap((item) =>
    item.images.map((image) => ({ ...image, title: item.title })),
  );
  return (
    <article className="rounded-[8px] border border-[#E1E7EC] bg-white px-4 py-5 shadow-[0_6px_14px_rgba(17,24,39,0.08)] sm:px-5">
      <h2 className="text-[20px] font-extrabold leading-tight text-[#292D73]">
        Project Gallery
      </h2>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {isPending ? Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[2/1.05] w-full" />
        )) : isError ? (
          <p className="text-[13px] text-red-600">Unable to load gallery.</p>
        ) : gallery.length === 0 ? (
          <p className="text-[13px] text-[#667085]">No gallery items available.</p>
        ) : gallery.map((item) => (
          <div
            key={item.publicId}
            className="relative aspect-[2/1.05] overflow-hidden rounded-[5px] bg-[#EAF2F7]"
          >
            <Image
              src={item.url}
              alt={item.title}
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
