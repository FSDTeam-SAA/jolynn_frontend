"use client";

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import { useBusinessOverview } from "@/hooks/use-dashboard-overview";
import { Image, Box, Star, MessageSquare } from "lucide-react"
import { useSession } from "next-auth/react";

// কার্ডের ডেটাগুলোকে একটা অ্যারেতে সাজিয়ে নেওয়া হয়েছে যাতে কোড ক্লিন থাকে
const cardData = [
  {
    title: "Gallery Image",
    key: "galleryImages" as const,
    icon: Image,
  },
  {
    title: "Total Services",
    key: "totalServices" as const,
    icon: Box,
  },
  {
    title: "Total Reviews",
    key: "totalReviews" as const,
    icon: Star,
  },
  {
    title: "Total Quote",
    key: "totalQuotes" as const,
    icon: MessageSquare,
  },
]

export default function OverviewStates() {
  const { data: session, status } = useSession();
  const user = session?.user as { token?: string; accessToken?: string } | undefined;
  const token = user?.accessToken ?? user?.token;
  const overviewQuery = useBusinessOverview(token);
  const isLoading = status === "loading" || (Boolean(token) && overviewQuery.isPending);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
      {cardData.map((item, index) => {
        const Icon = item.icon
        return (
          <Card key={index} className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
            <CardContent className="flex items-center gap-4 p-6">
              {/* আইকনের পেছনের লাইট ব্লু রাউন্ডেড ব্যাকগ্রাউন্ড */}
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef4f9]">
                <Icon className="h-6 w-6 text-[#1e295d]" />
              </div>
              
              {/* টেক্সট কন্টেন্ট */}
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium text-[#1e295d]/80">
                  {item.title}
                </p>
                <h3 className="text-3xl font-bold tracking-tight text-[#0f172a]">
                  {isLoading ? (
                    <Skeleton className="h-9 w-12" />
                  ) : overviewQuery.isError || !overviewQuery.data ? (
                    "—"
                  ) : (
                    overviewQuery.data.data[item.key]
                  )}
                </h3>
                {overviewQuery.isError && (
                  <button
                    type="button"
                    onClick={() => overviewQuery.refetch()}
                    className="text-left text-xs font-medium text-red-500 hover:underline"
                  >
                    Retry
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
