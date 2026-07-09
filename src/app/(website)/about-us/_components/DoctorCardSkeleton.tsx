"use client";

import { Skeleton } from "@/components/ui/skeleton";

export const DoctorCardSkeleton = () => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <Skeleton className="w-full h-48 md:h-56 rounded-xl mb-4" /> {/* image */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" /> {/* name */}
        <Skeleton className="h-4 w-1/2" /> {/* title */}
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
};

export const DoctorsGridSkeleton = () => {
  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <DoctorCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
