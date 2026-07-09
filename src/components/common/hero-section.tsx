"use client";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";

const HeroSection = ({title}: {title: string}) => {
    const session = useSession();
  console.log(session);
  return (
    // <div className="relative h-[400px] md:h-[500px] lg:h-[575px] flex items-center justify-center overflow-hidden">
    <div className="relative min-h-[calc(100vh)] flex items-center justify-center overflow-hidden">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src="/assets/videos/banner-video.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="container relative z-10 text-white text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[150%] text-center">
          {title}
        </h1>

        <div className="pt-2 md:pt-3 lg:pt-[14px] flex flex-col md:flex-row justify-center items-center gap-[13px]">
            <Link href="/booking">
          <Button className="h-[46px] shadow-[0_4px_7px_0_rgba(0,0,0,0.12)] text-sm font-medium leading-[150%] text-white py-[14px] px-[46px] rounded-[6px]">
            Book FREE Consult
          </Button>
        </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

