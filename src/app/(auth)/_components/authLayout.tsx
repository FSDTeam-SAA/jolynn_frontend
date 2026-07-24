import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

const AuthLayoutDesign = ({
  children,
  preventPageScroll = false,
}: {
  children: React.ReactNode;
  preventPageScroll?: boolean;
}) => {
  return (
    <div
      className={`relative min-h-dvh bg-[linear-gradient(180deg,_#292D73_0%,_#91C7D9_50%,_#CBE4E3_100%),_linear-gradient(0deg,_rgba(0,0,0,0.2),_rgba(0,0,0,0.2))] ${
        preventPageScroll ? "h-dvh overflow-hidden" : ""
      }`}
    >
      <Link
        href="/"
        aria-label="Back to home"
        className="fixed left-4 top-4 z-20 inline-flex h-10 items-center gap-2 rounded-full border border-white/40 bg-white/90 px-4 text-xs font-semibold text-[#292D73] shadow-md backdrop-blur-sm transition hover:-translate-x-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#292D73] sm:left-6 sm:top-6 sm:h-11 sm:px-5 sm:text-sm lg:left-8 lg:top-8"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>Back to Home</span>
      </Link>

      <div
        className={`flex w-full items-center justify-center px-0 ${
          preventPageScroll
            ? "h-dvh py-2 sm:py-4"
            : "min-h-dvh pb-6 pt-20 sm:pb-8 sm:pt-24 md:py-24 lg:py-28"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default AuthLayoutDesign;
