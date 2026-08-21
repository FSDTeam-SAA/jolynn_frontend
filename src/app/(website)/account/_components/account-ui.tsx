"use client";

import LogoutModal from "@/components/modals/LogoutModal";
import { useProfileQuery, useProfileUpdate } from "@/hooks/APicalling";
import type { SavedBusiness } from "@/hooks/use-saved-businesses";
import { cn } from "@/lib/utils";
import {
  Bookmark,
  BriefcaseBusiness,
  FileText,
  LockKeyhole,
  LogOut,
  MapPin,
  MessageCircle,
  MessageSquareCode,
  Pencil,
  Plus,
  Star,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState, type ChangeEvent, type ReactNode } from "react";
import { toast } from "sonner";
import {
  accountNavItems,
  type AccountSection,
} from "./account-data";
import ReportBusinessModal from "../../services/businesses/_components/report-business-modal";

const navIcons = {
  profile: User,
  "change-password": LockKeyhole,
  "save-services": Bookmark,
  "request-quote": FileText,
  "help-wanted": BriefcaseBusiness,
  "my-reviews" : MessageSquareCode,
  message: MessageCircle
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
    <section className="min-h-[calc(100vh-80px)] bg-[radial-gradient(circle_at_top_left,_#eef8f8_0,_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#ffffff_38%)] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="container max-w-[1440px]">
        <div className="grid items-start gap-5 lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-6">
          <AccountSidebar active={active} />
          <div
            className={cn(
              "grid min-w-0 gap-5",
              showProfileCard && "xl:grid-cols-[292px_minmax(0,1fr)]",
            )}
          >
            {showProfileCard ? <ProfileSummaryCard /> : null}
            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

const AccountSidebar = ({ active }: { active: AccountSection }) => {
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const confirmLogout = async () => {
    setIsLogoutOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <aside
        className="scrollbar-hide sticky top-2 z-20 flex gap-2 overflow-x-auto rounded-xl border border-[#e6eaf0] bg-white/95 p-2 shadow-[0_10px_35px_rgba(30,45,75,0.08)] backdrop-blur lg:top-24 lg:min-h-[620px] lg:flex-col lg:gap-1.5 lg:overflow-visible lg:rounded-2xl lg:p-3"
        aria-label="Account navigation"
      >
        <div className="hidden px-3 pb-2 pt-1 lg:block">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#98A2B3]">
            My Account
          </p>
        </div>

        {accountNavItems.map((item) => {
          const Icon = navIcons[item.id];
          const isActive = active === item.id;

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex h-11 shrink-0 items-center gap-2.5 rounded-xl px-3 text-[13px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73] focus-visible:ring-offset-2 lg:h-12 lg:w-full lg:text-[14px]",
                isActive
                  ? "bg-[#292D73] text-white shadow-[0_6px_14px_rgba(41,45,115,0.22)]"
                  : "text-[#667085] hover:bg-[#F2F5FF] hover:text-[#292D73]",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] transition-colors duration-300",
                  isActive
                    ? "bg-white/15"
                    : "bg-[#F2F4F7] text-[#667085] group-hover:bg-white group-hover:text-[#292D73]",
                )}
              >
                <Icon className="h-[17px] w-[17px]" />
              </span>
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}

        <div className="shrink-0 lg:border-y lg:border-[#e7e9f4] lg:py-4">
           <Link
            href="/add-your-business"
            className="inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#22245F] px-3 text-[13px] font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#17194D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22245F] focus-visible:ring-offset-2 lg:px-4"
          >
            <Plus className="h-4 w-4" />
            <span>Add your business</span>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsLogoutOpen(true)}
          className="group flex h-11 shrink-0 items-center gap-2.5 rounded-xl px-3 text-[13px] font-semibold text-[#EF4444] transition-all duration-200 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 lg:mt-auto lg:h-12 lg:w-full lg:text-[14px]"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] bg-red-50 transition-colors group-hover:bg-white">
            <LogOut className="h-[17px] w-[17px]" />
          </span>
          <span className="whitespace-nowrap">Log Out</span>
        </button>
      </aside>

      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={confirmLogout}
      />
    </>
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
    // profile?.address,
    // profile?.city,
    // profile?.state,
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
    <article className="rounded-2xl border border-[#e4e8ef] bg-white px-5 py-6 shadow-[0_14px_35px_rgba(32,42,70,0.08)] xl:min-h-[540px]">
      <div className="text-center">
        <div className="relative mx-auto h-[112px] w-[112px]">
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 border-[#E6E1D3] bg-[#F2F4F7]">
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
          </div>
          <label
            className="absolute bottom-1 right-0 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#292D73] text-white shadow-md transition hover:scale-105 hover:bg-[#1f225f]"
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
          {isLoading ? "Loading..." : profile?.username || "User"}
        </h2>
        {/* <p className="mt-1 text-[11px] font-medium text-[#667085]">
          {profile?.email ?? "—"}
        </p> */}
      </div>

      <dl className="mt-7 grid gap-3 text-[12px] leading-relaxed text-[#1F2937] sm:grid-cols-2 xl:grid-cols-1">
        <div>
          <dt className="inline font-extrabold">Name : </dt>
          <dd className="inline text-[#667085]">{name || "N/A"}</dd>
        </div>
        <div>
          <dt className="inline font-extrabold">Email : </dt>
          <dd className="inline break-all text-[#667085]">{profile?.email ?? "N/A"}</dd>
        </div>
        <div>
          <dt className="inline font-extrabold">Phone : </dt>
          <dd className="inline text-[#667085]">{profile?.phoneNumber || "N/A"}</dd>
        </div>
        <div>
          <dt className="inline font-extrabold">Location : </dt>
          <dd className="inline text-[#667085]">{location || "N/A"}</dd>
        </div>
        <div>
          <dt className="inline font-extrabold">Since : </dt>
          <dd className="inline text-[#667085]">{memberSince}</dd>
        </div>
      </dl>
    </article>
  );
};

export const SavedBusinessGrid = ({
  businesses,
  viewMode = "grid",
}: {
  businesses: SavedBusiness[];
  viewMode?: "grid" | "list";
}) => {
  const [selectedBusiness, setSelectedBusiness] = useState<{
    id: string;
    name: string;
  } | null>(null);

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-1 gap-5",
          viewMode === "grid" && "xl:grid-cols-2",
        )}
      >
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
              href={`/services/businesses/${business?.businessOwnerId}?tab=reviews`}
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
            <button
              type="button"
              onClick={() =>
                setSelectedBusiness({
                  id: business.businessOwnerId,
                  name: business.businessName,
                })
              }
              className="inline-flex h-[36px] items-center justify-center rounded-[5px] bg-[#A7A7A7] px-3 text-[11px] font-bold text-white transition hover:bg-[#8E8E8E]"
            >
              Report
            </button>
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

      <ReportBusinessModal
        ownerId={selectedBusiness?.id ?? ""}
        businessName={selectedBusiness?.name ?? ""}
        open={Boolean(selectedBusiness)}
        onOpenChange={(open) => {
          if (!open) setSelectedBusiness(null);
        }}
      />
    </>
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
    <article className="min-h-[470px] rounded-2xl border border-[#e4e8ef] bg-white px-4 py-5 shadow-[0_14px_35px_rgba(32,42,70,0.08)] sm:px-6 sm:py-7">
      <h1 className="text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-[#152033] sm:text-[28px]">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 text-[12px] font-medium text-[#667085]">
          {description}
        </p>
      ) : null}
      <div className="mt-6 sm:mt-8">{children}</div>
    </article>
  );
};

export const AccountSectionHeader = ({
  title,
  description,
  count,
  action,
}: {
  title: string;
  description: string;
  count?: string;
  action?: ReactNode;
}) => (
  <header className="mb-5 flex flex-col gap-4 rounded-2xl border border-[#e4e8ef] bg-white p-5 shadow-[0_10px_30px_rgba(32,42,70,0.07)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-[24px] font-extrabold tracking-[-0.02em] text-[#182230] sm:text-[28px]">
          {title}
        </h1>
        {count ? (
          <span className="rounded-full bg-[#eef0ff] px-2.5 py-1 text-[11px] font-bold text-[#292D73]">
            {count}
          </span>
        ) : null}
      </div>
      <p className="mt-1 max-w-2xl text-[12px] leading-5 text-[#667085] sm:text-[13px]">
        {description}
      </p>
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </header>
);

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
