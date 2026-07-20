import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Image, Box, Star, MessageSquare } from "lucide-react"

// কার্ডের ডেটাগুলোকে একটা অ্যারেতে সাজিয়ে নেওয়া হয়েছে যাতে কোড ক্লিন থাকে
const cardData = [
  {
    title: "Gallery Image",
    value: "06",
    percentage: "+180.1%",
    icon: Image,
  },
  {
    title: "Total Services",
    value: "12",
    percentage: "+180.1%",
    icon: Box,
  },
  {
    title: "Total Reviews",
    value: "12",
    percentage: "+180.1%",
    icon: Star,
  },
  {
    title: "Total Quote",
    value: "12",
    percentage: "+180.1%",
    icon: MessageSquare,
  },
]

export default function OverviewStates() {
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
                  {item.value}
                </h3>
                <p className="text-xs text-emerald-600 font-medium">
                  {item.percentage} <span className="text-gray-400 font-normal">from last month</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}