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
import type { ReactNode } from "react";
import {
  accountNavItems,
  accountUser,
  savedBusinesses,
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
      <div className="container max-w-[1140px]">
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
  return (
    <article className="min-h-[470px] rounded-[6px] border border-[#D9DEE7] bg-white px-5 py-6 shadow-[0_6px_14px_rgba(32,42,70,0.10)]">
      <div className="text-center">
        <div className="relative mx-auto h-[112px] w-[112px] overflow-hidden rounded-full border-4 border-[#E6E1D3]">
          <Image
            src={accountUser.avatar}
            alt={accountUser.name}
            fill
            sizes="112px"
            className="object-cover"
          />
          <button
            type="button"
            className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#292D73] text-white shadow"
            aria-label="Edit profile photo"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>

        <h2 className="mt-4 text-[18px] font-extrabold leading-tight text-[#292D73]">
          {accountUser.name}
        </h2>
        <p className="mt-1 text-[11px] font-medium text-[#667085]">
          {accountUser.email}
        </p>
      </div>

      <dl className="mt-7 space-y-4 text-[12px] leading-relaxed text-[#1F2937]">
        <div>
          <dt className="inline font-extrabold">Name: </dt>
          <dd className="inline text-[#667085]">{accountUser.name}</dd>
        </div>
        <div>
          <dt className="inline font-extrabold">Email: </dt>
          <dd className="inline text-[#667085]">{accountUser.email}</dd>
        </div>
        <div>
          <dt className="inline font-extrabold">Phone: </dt>
          <dd className="inline text-[#667085]">{accountUser.phone}</dd>
        </div>
        <div>
          <dt className="inline font-extrabold">Location: </dt>
          <dd className="inline text-[#667085]">{accountUser.location}</dd>
        </div>
        <div>
          <dt className="inline font-extrabold">Since: </dt>
          <dd className="inline text-[#667085]">{accountUser.since}</dd>
        </div>
      </dl>
    </article>
  );
};

export const SavedBusinessGrid = () => {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {savedBusinesses.map((business) => (
        <article
          key={business.id}
          className="rounded-[8px] bg-white p-4 shadow-[0_8px_24px_rgba(30,45,75,0.14)] ring-1 ring-[#E8ECF2]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className="h-[48px] w-[48px] shrink-0 rounded-full"
                style={{ backgroundColor: business.accentColor }}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <h3 className="truncate text-[16px] font-extrabold leading-tight text-[#292D73]">
                  {business.name}
                </h3>
                <span className="mt-1 inline-flex rounded-[3px] bg-[#DFEEEE] px-2 py-[2px] text-[10px] font-semibold leading-none text-[#426078]">
                  {business.category}
                </span>
              </div>
            </div>
            <Link
              href={business.reviewUrl}
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
              className="inline-flex h-[36px] items-center justify-center rounded-[5px] bg-[#292E78] px-3 text-[11px] font-bold text-white transition hover:bg-[#1F2464]"
            >
              View Profile
            </Link>
            <Link
              href={business.reportUrl}
              className="inline-flex h-[36px] items-center justify-center rounded-[5px] bg-[#A7A7A7] px-3 text-[11px] font-bold text-white transition hover:bg-[#8E8E8E]"
            >
              Report
            </Link>
            <Link
              href={business.whatsappUrl}
              className="inline-flex h-[36px] items-center justify-center rounded-[5px] border border-[#292E78] bg-white text-[#292E78] transition hover:bg-[#292E78] hover:text-white"
              aria-label={`Message ${business.name}`}
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
