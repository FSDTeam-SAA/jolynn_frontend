"use client";

import { useProfileQuery, useProfileUpdate } from "@/hooks/APicalling";
import type { SavedBusiness } from "@/hooks/use-saved-businesses";
import { cn } from "@/lib/utils";
import {
  Bookmark,
  FileText,
  LockKeyhole,
  LogOut,
  MapPin,
  MessageCircle,
  Pencil,
  Star,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { ChangeEvent, ReactNode } from "react";
import { toast } from "sonner";
import {
  accountNavItems,
  type AccountSection,
} from "./account-data";

const navIcons = {
  profile: User,
  "change-password": LockKeyhole,
  "save-services": Bookmark,
  "request-quote": FileText,
};

type AccountPageShellProps = {
  active: AccountSection;
  children: ReactNode;
  showProfileCard?: boolean;
};

export const AccountPageShell = ({
  active,
  children,
  showProfileCard = true,
}: AccountPageShellProps) => {
  return (
    <section className="bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="container">
        <div className="grid gap-5 lg:grid-cols-[180px_minmax(0,1fr)]">
          <AccountSidebar active={active} />
          <div
            className={cn(
              "grid gap-5",
              showProfileCard && "xl:grid-cols-[280px_minmax(0,1fr)]",
            )}
          >
            {showProfileCard ? <ProfileSummaryCard /> : null}
            <div>{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

const AccountSidebar = ({ active }: { active: AccountSection }) => {
  return (
    <aside className="flex gap-2 overflow-x-auto lg:block lg:space-y-5 lg:overflow-visible">
      {accountNavItems.map((item) => {
        const Icon = navIcons[item.id];
        const isActive = active === item.id;

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "flex h-10 shrink-0 items-center gap-2 rounded-[5px] px-3 text-[12px] font-semibold transition lg:w-full",
              isActive
                ? "bg-[#292D73] text-white"
                : "text-[#667085] hover:bg-[#F2F4F7] hover:text-[#292D73]",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}

      <Link
        href="/login"
        className="flex h-10 shrink-0 items-center gap-2 rounded-[5px] px-3 text-[12px] font-semibold text-[#EF4444] transition hover:bg-red-50 lg:w-full"
      >
        <LogOut className="h-4 w-4" />
        Log Out
      </Link>
    </aside>
  );
};

export const ProfileSummaryCard = () => {
  const { data: session } = useSession();
  const sessionUser = session?.user as
    | { token?: string; accessToken?: string }
    | undefined;
  const { data: profileResponse, isLoading } = useProfileQuery(
    sessionUser?.accessToken ?? sessionUser?.token,
  );
  const profile = profileResponse?.data;
  const { mutate: updateProfile, isPending: isPictureUpdating } =
    useProfileUpdate(sessionUser?.accessToken ?? sessionUser?.token);
  const name = [profile?.firstName, profile?.lastName]
    .filter(Boolean)
    .join(" ");
  const location = [
    profile?.address,
    profile?.city,
    profile?.state,
    profile?.country,
    profile?.postcode,
  ]
    .filter(Boolean)
    .join(", ");
  const memberSince = profile?.createdAt
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(profile.createdAt))
    : "—";

  const handlePictureChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !profile) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile picture must be smaller than 5 MB.");
      return;
    }

    updateProfile({
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      email: profile.email ?? "",
      phoneNumber: profile.phoneNumber ?? "",
      address: profile.address ?? "",
      state: profile.state ?? "",
      country: profile.country ?? "",
      postcode: profile.postcode ?? "",
      gender: profile.gender ?? "male",
      profilePicture: file,
    });
  };

  return (
    <article className="min-h-[470px] rounded-[6px] border border-[#D9DEE7] bg-white px-5 py-6 shadow-[0_6px_14px_rgba(32,42,70,0.10)]">
      <div className="text-center">
        <div className="relative mx-auto flex h-[112px] w-[112px] items-center justify-center overflow-hidden rounded-full border-4 border-[#E6E1D3] bg-[#F2F4F7]">
          {profile?.profilePicture ? (
            <Image
              src={profile.profilePicture}
              alt={name || "Profile picture"}
              fill
              sizes="112px"
              className="object-cover"
            />
          ) : (
            <User className="h-10 w-10 text-[#98A2B3]" />
          )}
          <label
            className="absolute bottom-1 right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#292D73] text-white shadow"
            aria-label="Edit profile photo"
            title="Change profile picture"
          >
            <Pencil className="h-3.5 w-3.5" />
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handlePictureChange}
              disabled={isPictureUpdating || !profile}
              className="sr-only"
            />
          </label>
        </div>

        <h2 className="mt-4 text-[18px] font-extrabold leading-tight text-[#292D73]">
          {isLoading ? "Loading..." : name || "User"}
        </h2>
        <p className="mt-1 text-[11px] font-medium text-[#667085]">
          {profile?.email ?? "—"}
        </p>
      </div>

      <dl className="mt-7 space-y-4 text-[12px] leading-relaxed text-[#1F2937]">
        <div>
          <dt className="inline font-extrabold">Name: </dt>
          <dd className="inline text-[#667085]">{name || "—"}</dd>
        </div>
        <div>
          <dt className="inline font-extrabold">Email: </dt>
          <dd className="inline break-all text-[#667085]">{profile?.email ?? "—"}</dd>
        </div>
        <div>
          <dt className="inline font-extrabold">Phone: </dt>
          <dd className="inline text-[#667085]">{profile?.phoneNumber || "—"}</dd>
        </div>
        <div>
          <dt className="inline font-extrabold">Location: </dt>
          <dd className="inline text-[#667085]">{location || "—"}</dd>
        </div>
        <div>
          <dt className="inline font-extrabold">Since: </dt>
          <dd className="inline text-[#667085]">{memberSince}</dd>
        </div>
      </dl>
    </article>
  );
};

export const SavedBusinessGrid = ({ businesses }: { businesses: SavedBusiness[] }) => {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {businesses.map(({ id, businessOwner: business }) => (
        <article
          key={id}
          className="rounded-[8px] bg-white p-4 shadow-[0_8px_24px_rgba(30,45,75,0.14)] ring-1 ring-[#E8ECF2]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="relative h-[48px] w-[48px] shrink-0 overflow-hidden rounded-full bg-[#F2F4F7]">
                {business.service.logo?.url ? <Image src={business.service.logo.url} alt="" fill sizes="48px" className="object-cover" /> : <Bookmark className="absolute inset-0 m-auto h-5 w-5 text-[#98A2B3]" />}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-[16px] font-extrabold leading-tight text-[#292D73]">
                  {business.businessName}
                </h3>
                <span className="mt-1 inline-flex rounded-[3px] bg-[#DFEEEE] px-2 py-[2px] text-[10px] font-semibold leading-none text-[#426078]">
                  {business.category}
                </span>
              </div>
            </div>
            <Link
              href={`/services/businesses/${business.businessOwnerId}`}
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-[5px] border border-[#F8AA18] bg-[#FFF6D8] px-5 text-[11px] font-medium text-[#E56D00] transition hover:bg-[#F8AA18] hover:text-white"
            >
              Review
            </Link>
          </div>

          <div className="mt-3 flex items-center gap-1.5">
            <div className="flex items-center gap-[1px]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={cn("h-[13px] w-[13px] text-[#FFB800]", index < Math.round(business.rating) && "fill-[#FFB800]")}
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-[#292E78]">
              {business.rating.toFixed(1)}
            </span>
            <span className="text-[11px] font-medium text-[#667085]">
              ({business.totalReviews} reviews)
            </span>
          </div>

          <div className="mt-3 flex items-center gap-1 text-[10.5px] font-medium text-[#667085]">
            <MapPin className="h-3.5 w-3.5 text-[#667085]" />
            <span>{[business.address, business.city, business.state].filter(Boolean).join(", ") || business.serviceArea}</span>
          </div>

          <p className="mt-1.5 min-h-[38px] text-[11px] font-medium leading-[1.35] text-[#667085]">
            {business.service.description}
          </p>

          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_36px] gap-1.5">
            <Link
              href={`/services/businesses/${business.businessOwnerId}`}
              className="inline-flex h-[36px] items-center justify-center rounded-[5px] bg-[#292E78] px-3 text-[11px] font-bold text-white transition hover:bg-[#1F2464]"
            >
              View Profile
            </Link>
            <Link
              href={`/report?businessOwnerId=${business.businessOwnerId}`}
              className="inline-flex h-[36px] items-center justify-center rounded-[5px] bg-[#A7A7A7] px-3 text-[11px] font-bold text-white transition hover:bg-[#8E8E8E]"
            >
              Report
            </Link>
            <Link
              href={business.businessWebsiteUrl || `/services/businesses/${business.businessOwnerId}`}
              className="inline-flex h-[36px] items-center justify-center rounded-[5px] border border-[#292E78] bg-white text-[#292E78] transition hover:bg-[#292E78] hover:text-white"
              aria-label={`Visit ${business.businessName}`}
            >
              <MessageCircle className="h-[17px] w-[17px]" />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
};

export const AccountPanel = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => {
  return (
    <article className="min-h-[470px] rounded-[6px] border border-[#D9DEE7] bg-white px-5 py-6 shadow-[0_6px_14px_rgba(32,42,70,0.10)]">
      <h1 className="text-[28px] font-extrabold leading-none text-[#152033]">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 text-[12px] font-medium text-[#667085]">
          {description}
        </p>
      ) : null}
      <div className="mt-8">{children}</div>
    </article>
  );
};

export const EmptyAccountHint = () => {
  return (
    <AccountPageShell active="profile">
      <AccountPanel
        title="Personal Information"
        description="Manage your personal information and profile details."
      >
        <div className="flex min-h-[220px] items-center justify-center rounded-[8px] bg-[#F8FAFC] text-[13px] font-medium text-[#667085]">
          Select a section from the account menu.
        </div>
      </AccountPanel>
    </AccountPageShell>
  );
};
