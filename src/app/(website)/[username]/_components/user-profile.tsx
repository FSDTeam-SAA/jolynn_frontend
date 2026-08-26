"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import {
  BriefcaseBusiness,
  Globe2,
  ImageIcon,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  isValidPublicUsername,
  normalizePublicUsername,
} from "@/lib/public-username";

type PublicProfile = {
  id: string;
  username: string;
  businessName: string;
  ownerName: string;
  profilePicture?: string;
  bio?: string;
  category?: string;
  serviceArea?: string;
  businessWebsiteUrl?: string;
  businessEmail?: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  state?: string;
  address?: string;
};

type ProfileSummary = {
  totalServices: number;
  totalGalleryImages: number;
  totalReviews: number;
  averageRating: number;
};

type PublicService = {
  _id: string;
  title: string;
  description: string;
  logo?: {
    url: string;
    publicId: string;
  };
  createdAt: string;
};

type GalleryGroup = {
  _id: string;
  title: string;
  images: {
    url: string;
    publicId: string;
  }[];
  createdAt: string;
};

type PublicProfileResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    profile: PublicProfile;
    summary: ProfileSummary;
    services: PublicService[];
    gallery: GalleryGroup[];
  };
};

const fetchPublicProfile = async (
  username: string,
): Promise<PublicProfileResponse> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("The public profile service is not configured.");

  const canonicalUsername = normalizePublicUsername(username);
  const response = await fetch(
    `${apiUrl}/user/public/${encodeURIComponent(canonicalUsername)}`,
    { headers: { accept: "*/*" } },
  );
  const result = (await response.json()) as PublicProfileResponse;

  if (!response.ok || !result.success || !result.data?.profile) {
    throw new Error(result.message || "Unable to load this public profile.");
  }

  return result;
};

const ProfileSkeleton = () => (
  <main className="min-h-screen bg-[#F5F8F7]" aria-label="Loading public profile">
    <div className="border-b border-[#E2E8F0] bg-white">
      <div className="container py-10 sm:py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Skeleton className="h-28 w-28 shrink-0 rounded-[18px] sm:h-32 sm:w-32" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-9 w-full max-w-[360px]" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-11 w-32" />
            <Skeleton className="h-11 w-32" />
          </div>
        </div>
      </div>
    </div>
    <div className="container py-8 sm:py-10">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-[10px]" />
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Skeleton className="h-44 rounded-[10px]" />
          <Skeleton className="h-64 rounded-[10px]" />
        </div>
        <Skeleton className="h-72 rounded-[10px]" />
      </div>
    </div>
  </main>
);

const UserProfile = ({ username }: { username: string }) => {
  const canonicalUsername = normalizePublicUsername(username);
  const hasValidUsername = isValidPublicUsername(canonicalUsername);
  const profileQuery = useQuery<PublicProfileResponse>({
    queryKey: ["public-user-profile", canonicalUsername],
    queryFn: () => fetchPublicProfile(canonicalUsername),
    enabled: hasValidUsername,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (!hasValidUsername) {
    return (
      <main className="min-h-[560px] bg-[#F5F8F7] px-4 py-20">
        <div className="container flex min-h-[360px] max-w-[720px] flex-col items-center justify-center rounded-[12px] border border-[#E2E8F0] bg-white px-6 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-[#111827]">
            Profile unavailable
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#667085]">
            This profile uses an old display name instead of a public username.
            Please open it again from a post that has a valid @username.
          </p>
          <Link
            href="/job-posts"
            className="mt-6 inline-flex h-11 items-center rounded-[6px] bg-[#292D73] px-6 text-sm font-bold text-white transition hover:bg-[#20255F]"
          >
            Back to Help Wanted
          </Link>
        </div>
      </main>
    );
  }

  if (profileQuery.isPending) return <ProfileSkeleton />;

  if (profileQuery.isError || !profileQuery.data?.data) {
    return (
      <main className="min-h-[560px] bg-[#F5F8F7] px-4 py-20">
        <div className="container flex min-h-[360px] max-w-[720px] flex-col items-center justify-center rounded-[12px] border border-red-200 bg-white px-6 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-[#111827]">
            Profile unavailable
          </h1>
          <p className="mt-3 text-sm text-[#667085]">
            {profileQuery.error instanceof Error
              ? profileQuery.error.message
              : "We couldn't find this public profile."}
          </p>
          <button
            type="button"
            onClick={() => profileQuery.refetch()}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-[6px] bg-[#292D73] px-6 text-sm font-bold text-white transition hover:bg-[#20255F]"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const { profile, summary, services, gallery } = profileQuery.data.data;
  const galleryImages = gallery.flatMap((group) =>
    group.images.map((image) => ({ ...image, title: group.title, groupId: group._id })),
  );
  const publicGalleryImages = galleryImages[1] ? [galleryImages[1]] : [];
  const location = [profile.address, profile.city, profile.state]
    .filter(Boolean)
    .join(", ");
  const stats = [
    {
      label: "Services",
      value: summary.totalServices,
      icon: BriefcaseBusiness,
    },
    {
      label: "Gallery Images",
      value: summary.totalGalleryImages,
      icon: ImageIcon,
    },
    { label: "Reviews", value: summary.totalReviews, icon: Star },
    {
      label: "Average Rating",
      value: summary.averageRating.toFixed(1),
      icon: Star,
    },
  ];

  return (
    <main className="min-h-screen bg-[#F5F8F7]">
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="container py-10 sm:py-12 lg:py-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
               <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[18px] text-4xl font-extrabold text-white sm:h-32 sm:w-32">
              {profile.profilePicture ? (
                <Image
                  src={profile.profilePicture}
                  alt={profile.businessName}
                  fill
                  priority
                  sizes="128px"
                  className="object-cover w-16 h-16 rounded-full border-2"
                />
              ) : (
                profile.businessName.charAt(0).toUpperCase()
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="break-words text-3xl font-extrabold leading-tight text-[#111827] sm:text-4xl">
                  {profile.businessName}
                </h1>
                {profile.category && (
                  <span className="rounded-full bg-[#DFEEEE] px-3 py-1 text-xs font-bold text-[#426078]">
                    {profile.category}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm font-semibold text-[#667085]">
                @{profile.username}
                {profile.ownerName ? ` · ${profile.ownerName}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="flex gap-0.5" aria-label={`${summary.averageRating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 ${
                        index < Math.round(summary.averageRating)
                          ? "fill-[#FFB800] text-[#FFB800]"
                          : "text-[#D9DEE7]"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-extrabold text-[#292D73]">
                  {summary.averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-[#667085]">
                  ({summary.totalReviews} reviews)
                </span>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[210px]">
              {profile.phoneNumber && (
                <Link
                  href={`tel:${profile.phoneNumber}`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[6px] bg-[#292D73] px-5 text-sm font-bold text-white transition hover:bg-[#20255F]"
                >
                  <Phone className="h-4 w-4" />
                  Call Business
                </Link>
              )}
              {profile.businessEmail && (
                <Link
                  href="/account/message"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[6px] border border-[#292D73] bg-white px-5 text-sm font-bold text-[#292D73] transition hover:bg-[#F2F5FF]"
                >
                  <Mail className="h-4 w-4" />
                  Message
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8 sm:py-10 lg:py-12">
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Profile summary">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-[10px] border border-[#DDE4EA] bg-white p-4 shadow-[0_5px_16px_rgba(30,45,75,0.08)] sm:p-5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#EAF2F2] text-[#292D73]">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="mt-3 text-2xl font-extrabold text-[#292D73]">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-semibold text-[#667085] sm:text-sm">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </section>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <section className="rounded-[10px] border border-[#DDE4EA] bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-extrabold text-[#111827]">About This Business</h2>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#475467] sm:text-base">
                {profile.bio || "This business has not added a description yet."}
              </p>
            </section>

            <section className="rounded-[10px] border border-[#DDE4EA] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-extrabold text-[#111827]">Services</h2>
                <span className="text-sm font-semibold text-[#667085]">
                  {services.length} available
                </span>
              </div>
              {services.length === 0 ? (
                <p className="mt-5 text-sm text-[#667085]">No services have been added yet.</p>
              ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {services.map((service) => (
                    <article
                      key={service._id}
                      className="flex gap-4 rounded-[8px] border border-[#E2E8F0] bg-[#FAFCFC] p-4 transition hover:border-[#B7DADA] hover:shadow-sm"
                    >
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-white ring-1 ring-[#E2E8F0]">
                        {service.logo?.url ? (
                          <Image
                            src={service.logo.url}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-contain p-1"
                          />
                        ) : (
                          <BriefcaseBusiness className="h-5 w-5 text-[#292D73]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-[#292D73]">{service.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-[#667085]">
                          {service.description}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28">
            <section className="rounded-[10px] border border-[#DDE4EA] bg-white p-5 shadow-sm">
              <h2 className="text-lg font-extrabold text-[#111827]">Business Information</h2>
              <div className="mt-5 space-y-4 text-sm">
                {location && (
                  <div className="flex items-start gap-3 text-[#475467]">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#292D73]" />
                    <span>{location}</span>
                  </div>
                )}
                {profile.country && (
                  <div className="flex items-start gap-3 text-[#475467]">
                    <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-[#292D73]" />
                    <span>Country: {profile.country}</span>
                  </div>
                )}
                {profile.serviceArea && (
                  <div className="flex items-start gap-3 text-[#475467]">
                    <BriefcaseBusiness className="mt-0.5 h-4 w-4 shrink-0 text-[#292D73]" />
                    <span>Service area: {profile.serviceArea}</span>
                  </div>
                )}
                {profile.phoneNumber && (
                  <Link href={`tel:${profile.phoneNumber}`} className="flex items-center gap-3 text-[#475467] hover:text-[#292D73]">
                    <Phone className="h-4 w-4 shrink-0 text-[#292D73]" />
                    {profile.phoneNumber}
                  </Link>
                )}
                {profile.businessEmail && (
                  <Link href={`mailto:${profile.businessEmail}`} className="flex items-center gap-3 break-all text-[#475467] hover:text-[#292D73]">
                    <Mail className="h-4 w-4 shrink-0 text-[#292D73]" />
                    {profile.businessEmail}
                  </Link>
                )}
                {profile.businessWebsiteUrl && (
                  <Link
                    href={profile.businessWebsiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 break-all text-[#475467] hover:text-[#292D73]"
                  >
                    <Globe2 className="h-4 w-4 shrink-0 text-[#292D73]" />
                    {profile.businessWebsiteUrl}
                  </Link>
                )}
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-6 rounded-[10px] border border-[#DDE4EA] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-extrabold text-[#111827]">Gallery</h2>
            <span className="text-sm font-semibold text-[#667085]">
              {publicGalleryImages.length} image
            </span>
          </div>
          {publicGalleryImages.length === 0 ? (
            <p className="mt-5 text-sm text-[#667085]">No gallery images have been added yet.</p>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {publicGalleryImages.map((image) => (
                <figure
                  key={`${image.groupId}-${image.publicId}`}
                  className="group relative w-full overflow-hidden rounded-[9px] bg-[#EAF2F2]"
                >
                  <div className="relative h-56 w-full">
                    <Image
                      src={image.url}
                      alt={`${image.title} gallery image`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-10">
                      <figcaption className="text-sm font-bold text-white">{image.title}</figcaption>
                    </div>
                  </div>
                </figure>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default UserProfile;
