import React from "react";
import { Image, Box, Star, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// কার্ডের ডাটা স্ট্রাকচার
const statsData = [
  {
    id: 1,
    title: "Gallery Image",
    value: "06",
    change: "+180.1% from last month",
    icon: Image,
  },
  {
    id: 2,
    title: "Total Services",
    value: "12",
    change: "+180.1% from last month",
    icon: Box,
  },
  {
    id: 3,
    title: "Total Reviews",
    value: "12",
    change: "+180.1% from last month",
    icon: Star,
  },
  {
    id: 4,
    title: "Total Quote",
    value: "12",
    change: "+180.1% from last month",
    icon: MessageSquare,
  },
];

export default function DashboardStats() {
  return (
    <div className="w-full bg-[#f8f9fa] p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {statsData.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.id} className="border-0 shadow-sm rounded-xl overflow-hidden bg-white">
              <CardContent className="p-6 flex items-center space-x-4">
                {/* আইকন কন্টেইনার (Light Blue Circular Background) */}
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#edf2f7] text-[#1e293b]">
                  <IconComponent className="w-6 h-6 stroke-[1.75]" />
                </div>
                
                {/* টেক্সট ও ভ্যালু কন্টেইনার */}
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-[#2d3748]">
                    {stat.title}
                  </p>
                  <h3 className="text-3xl font-bold text-[#0f172a] tracking-tight">
                    {stat.value}
                  </h3>
                  <p className="text-xs font-medium text-[#16a34a]">
                    {stat.change}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}