"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, Building2, ExternalLink, MapPin, Phone, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ApiSuccess,
  ReferralProfile,
  ReferralApiError,
  getReferralApiUrl,
  parseReferralResponse,
} from "@/lib/business-referrals";

const Stars = ({ rating }: { rating: number }) => (
  <span className="inline-flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${index < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
      />
    ))}
  </span>
);

export default function BusinessReferralProfilePage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/services/businesses");
    }
  };

  const referralQuery = useQuery({
    queryKey: ["business-referral-profile", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const response = await fetch(
        `${getReferralApiUrl()}/business-referrals/${encodeURIComponent(slug)}`,
        { headers: { Accept: "application/json" } },
      );
      return parseReferralResponse<ApiSuccess<ReferralProfile>>(response);
    },
  });

  if (referralQuery.isPending) {
    return (
      <main className="container min-h-[60vh] px-4 py-12">
        <div className="mx-auto h-[520px] max-w-5xl animate-pulse rounded-3xl bg-slate-100" />
      </main>
    );
  }

  if (referralQuery.isError || !referralQuery.data?.data) {
    return (
      <main className="container flex min-h-[60vh] items-center justify-center px-4 py-12">
        <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Building2 className="mx-auto h-11 w-11 text-slate-400" />
          <h1 className="mt-4 text-2xl font-bold text-[#171A3A]">Referral not available</h1>
          <p className="mt-2 text-sm text-slate-600">{referralQuery.error instanceof ReferralApiError && referralQuery.error.status === 404 ? "This referred business could not be found or is no longer public." : "We could not load this referral. Please try again."}</p>
          {!(referralQuery.error instanceof ReferralApiError && referralQuery.error.status === 404) ? <button type="button" onClick={() => void referralQuery.refetch()} className="mt-4 block w-full text-sm font-bold text-[#292D73] underline">Try again</button> : null}
          <button
            type="button"
            onClick={handleBack}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-[#292D73] px-5 text-sm font-bold text-white transition hover:bg-[#20255F] cursor-pointer"
          >
            Back
          </button>
        </div>
      </main>
    );
  }

  const referral = referralQuery.data.data;
  const owner = referral.ownerManagedProfile;
  const isClaimed = referral.claimStatus === "claimed";
  const businessName = owner ? owner.businessName || "Local business" : referral.businessName;

  const rawImages: (string | undefined)[] = [
    ...(owner?.profilePicture ? [owner.profilePicture] : []),
    ...(Array.isArray(referral.images) ? referral.images : []),
    referral.image,
    ...(owner?.backgroundImage ? [owner.backgroundImage] : []),
  ];

  const allImages = Array.from(
    new Set(
      rawImages.filter(
        (img): img is string => typeof img === "string" && img.trim().length > 0,
      ),
    ),
  );

  const currentMainImage =
    selectedImage && allImages.includes(selectedImage)
      ? selectedImage
      : (allImages[0] ?? null);

  const location = [owner ? owner.city : referral.city, owner ? owner.state : referral.state, owner?.country]
    .filter(Boolean)
    .join(", ");
  const category = owner ? owner.category : referral.category;
  const phone = owner ? owner.businessPhone : referral.businessPhone;
  const website = owner?.businessWebsiteUrl;

  return (
    <main className="bg-[linear-gradient(180deg,#f3f8f8_0%,#fff_42%)] px-4 py-10 sm:py-14">
      <div className="container max-w-5xl">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#292D73] transition-colors hover:text-[#1E235E] hover:underline cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <article className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_22px_70px_rgba(41,45,115,0.10)]">
          <div className="grid gap-0 md:grid-cols-[380px_minmax(0,1fr)] lg:grid-cols-[430px_minmax(0,1fr)]">
            {allImages.length > 1 ? (
              <div className="flex h-full flex-row gap-2.5 bg-slate-50/80 p-3 sm:p-4 md:min-h-[420px]">
                {/* Left side smaller sub-images */}
                <div className="flex shrink-0 flex-col gap-2.5 overflow-y-auto max-h-[380px] sm:max-h-[420px] pr-0.5">
                  {allImages.map((img, idx) => {
                    const isSelected = img === currentMainImage;
                    return (
                      <button
                        key={`${img}-${idx}`}
                        type="button"
                        onClick={() => setSelectedImage(img)}
                        aria-label={`Select image ${idx + 1}`}
                        className={`relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#292D73] ring-2 ring-[#292D73]/30 shadow-md scale-[1.02]"
                            : "border-slate-200/90 opacity-70 hover:opacity-100 hover:border-slate-400"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${businessName} sub-image ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Main image */}
                <div className="relative flex-1 min-h-[260px] md:min-h-[380px] overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
                  {currentMainImage ? (
                    <Image
                      src={currentMainImage}
                      alt={businessName}
                      fill
                      className="object-cover transition-opacity duration-300"
                      sizes="(max-width: 768px) 100vw, 360px"
                      priority
                    />
                  ) : (
                    <div className="flex h-full min-h-[260px] items-center justify-center">
                      <Building2 className="h-20 w-20 text-slate-300" />
                    </div>
                  )}
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#292D73] px-3 py-1.5 text-xs font-bold text-white shadow">
                    <BadgeCheck className="h-4 w-4" /> Community referral
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative min-h-[260px] bg-slate-100 md:min-h-[390px]">
                {currentMainImage ? (
                  <Image
                    src={currentMainImage}
                    alt={businessName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 430px"
                    priority
                  />
                ) : (
                  <div className="flex h-full min-h-[260px] items-center justify-center">
                    <Building2 className="h-20 w-20 text-slate-300" />
                  </div>
                )}
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[#292D73] px-3 py-1.5 text-xs font-bold text-white shadow">
                  <BadgeCheck className="h-4 w-4" /> Community referral
                </span>
              </div>
            )}

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#667085]">{category || "Local business"}</p>
                  <h1 className="mt-2 text-3xl font-extrabold text-[#171A3A]">{businessName}</h1>
                  {location ? <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600"><MapPin className="h-4 w-4" />{location}</p> : null}
                </div>
                {isClaimed ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    Verified owner
                  </span>
                ) : null}
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-xl bg-amber-50 px-4 py-3">
                <Stars rating={referral.rating} />
                <span className="text-sm font-extrabold text-slate-800">{referral.rating.toFixed(1)}</span>
                <span className="text-xs text-slate-500">Referral review</span>
              </div>

              <blockquote className="mt-5 border-l-4 border-[#75B8AE] pl-4 text-sm leading-7 text-slate-700">“{referral.review}”</blockquote>
              <p className="mt-3 text-xs text-slate-500">
                Referred by{" "}
                {referral.referredBy?.profileUrl || referral.referredBy?.username ? (
                  <Link
                    href={
                      referral.referredBy.profileUrl ||
                      `/${encodeURIComponent(referral.referredBy.username!)}`
                    }
                    className="font-bold text-[#292D73] hover:underline"
                  >
                    {referral.referredBy.name || "Community member"}
                  </Link>
                ) : (
                  <span className="font-bold text-[#292D73]">{referral.referredBy?.name || "Community member"}</span>
                )}
              </p>
              {isClaimed ? <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-800">This business was referred by {referral.referredBy?.name || "Community member"} and is now managed by its verified owner.</p> : null}

              {phone ? (
                <div className="mt-6 text-sm text-slate-600">
                  <a href={`tel:${phone}`} className="inline-flex items-center gap-2 hover:text-[#292D73]">
                    <Phone className="h-4 w-4" />
                    <span>{phone}</span>
                  </a>
                </div>
              ) : null}

              {owner?.bio ? <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-600">{owner.bio}</p> : null}
              {owner?.address ? <p className="mt-3 text-sm text-slate-600">Address: {[owner.address, owner.postcode].filter(Boolean).join(", ")}</p> : null}
              {owner?.serviceArea ? <p className="mt-2 text-sm text-slate-600">Service area: {owner.serviceArea}</p> : null}
              {website && /^https?:\/\//i.test(website) ? <a href={website} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#292D73] hover:underline">Business website <ExternalLink className="h-4 w-4" /></a> : null}

              {isClaimed && referral.canonicalProfileUrl ? (
                <Link href={referral.canonicalProfileUrl} className="mt-7 inline-flex h-11 items-center gap-2 rounded-lg bg-[#292D73] px-5 text-sm font-bold text-white hover:bg-[#20255F]">
                  Visit owner-managed profile <ExternalLink className="h-4 w-4" />
                </Link>
              ) : referral.isClaimable ? (
                <div className="mt-7 rounded-xl border border-[#D9E2FF] bg-[#F5F7FF] p-4">
                  <p className="text-sm font-bold text-[#171A3A]">Claim this Business</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">For your security, use the private claim link sent to the business email.</p>
                </div>
              ) : null}
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
