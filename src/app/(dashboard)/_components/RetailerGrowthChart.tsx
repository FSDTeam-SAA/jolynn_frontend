"use client";

import React, { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";

// ইমেজ অনুযায়ী ডামি ডাটা (Jan - Dec)
const data = [
  { name: "Jan", growth: 10 },
  { name: "Feb", growth: 35 },
  { name: "Mar", growth: 30 },
  { name: "Apr", growth: 20 },
  { name: "May", growth: 48 },
  { name: "June", growth: 65 },
  { name: "July", growth: 80 },
  { name: "Aug", growth: 70 },
  { name: "Sep", growth: 78 },
  { name: "Oct", growth: 82 },
  { name: "Nov", growth: 72 },
  { name: "Dec", growth: 118 },
];

export default function RetailerGrowthChart() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, index) => currentYear - index);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const chartWidth = 1200;
  const chartHeight = 280;
  const padding = { top: 15, right: 15, bottom: 35, left: 45 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  const points = data.map((item, index) => ({
    ...item,
    x: padding.left + (index / (data.length - 1)) * plotWidth,
    y: padding.top + plotHeight - (item.growth / 120) * plotHeight,
  }));
  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + plotHeight} L ${points[0].x} ${padding.top + plotHeight} Z`;
  const yTicks = [0, 30, 60, 90, 120];

  return (
    <div className="w-full rounded-xl border border-[#EFE2C7] p-5 md:p-6 mt-10">
      
      {/* হেডার সেকশন: টাইটেল এবং ডেট ফিল্টার */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-base md:text-lg font-semibold tracking-wide text-[#F7E4B3]">
          Retailer Growth
        </h2>
        
        {/* বছর ফিল্টার */}
        <div className="relative flex items-center rounded-lg border border-[#CBA24A]/30 bg-[#140d09]/40 text-[#cca352] transition-colors focus-within:border-[#CBA24A]/70">
          <Calendar className="pointer-events-none ml-3 h-3.5 w-3.5 shrink-0 text-[#CBA24A]" />
          <select
            aria-label="Select chart year"
            value={selectedYear}
            onChange={(event) => setSelectedYear(Number(event.target.value))}
            className="h-8 cursor-pointer appearance-none bg-transparent pl-2 pr-8 text-[11px] font-medium text-[#cca352] outline-none"
          >
            {years.map((year) => (
              <option key={year} value={year} className="bg-[#2A1E10] text-[#F7E4B3]">
                {year}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#CBA24A]" />
        </div>
      </div>

      {/* রেস্পন্সিভ চার্ট কন্টেইনার */}
      <div className="h-[250px] w-full md:h-[300px]">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-full w-full overflow-visible"
          role="img"
          aria-label={`Retailer growth chart for ${selectedYear}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#cca352" stopOpacity="0.2" />
              <stop offset="95%" stopColor="#cca352" stopOpacity="0" />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => {
            const y = padding.top + plotHeight - (tick / 120) * plotHeight;
            return (
              <g key={tick}>
                <line x1={padding.left} x2={chartWidth - padding.right} y1={y} y2={y} stroke="#CBA24A" strokeOpacity="0.15" />
                <text x={padding.left - 12} y={y + 4} textAnchor="end" fill="#a8a29e" fontSize="10">{tick}</text>
              </g>
            );
          })}

          <path d={areaPath} fill="url(#colorGrowth)" />
          <path d={linePath} fill="none" stroke="#cca352" strokeWidth="3" vectorEffect="non-scaling-stroke" />

          {points.map((point) => (
            <g key={point.name}>
              <circle cx={point.x} cy={point.y} r="4" fill="#2A1E10" stroke="#cca352" strokeWidth="2" vectorEffect="non-scaling-stroke">
                <title>{`${point.name}: ${point.growth}`}</title>
              </circle>
              <text x={point.x} y={chartHeight - 8} textAnchor="middle" fill="#a8a29e" fontSize="10">{point.name}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
