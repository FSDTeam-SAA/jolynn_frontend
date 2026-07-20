"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useRecentBusinessQuotes } from "@/hooks/use-dashboard-overview";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link";
import { useSession } from "next-auth/react";

const formatQuoteDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "—", time: "" };

  return {
    date: new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date),
  };
};

export default function RecentQuote() {
  const { data: session, status } = useSession();
  const user = session?.user as { token?: string; accessToken?: string } | undefined;
  const token = user?.accessToken ?? user?.token;
  const quoteQuery = useRecentBusinessQuotes(token);
  const requestsData = quoteQuery.data?.data ?? [];
  const isLoading = status === "loading" || (Boolean(token) && quoteQuery.isPending);

  return (
    <div className="w-full">
      {/* হেডার সেকশন */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#0f172a]">
          Recent Quote Requests
        </h2>
        <Link href="/quote-request" className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
          See All
        </Link>
      </div>

      {/* টেবিল কন্টেইনার (হোয়াইট ব্যাকগ্রাউন্ড এবং শ্যাডো) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full border-collapse">
            <TableHeader className="bg-white">
              <TableRow className="border-b border-gray-100">
                <TableHead className="py-5 text-center font-medium text-slate-500 text-[14px]">Name</TableHead>
                <TableHead className="py-5 text-center font-medium text-slate-500 text-[14px]">Email Address</TableHead>
                <TableHead className="py-5 text-center font-medium text-slate-500 text-[14px]">Phone Number</TableHead>
                <TableHead className="py-5 text-center font-medium text-slate-500 text-[14px]">Date & time</TableHead>
                <TableHead className="py-5 text-center font-medium text-slate-500 text-[14px]">Service</TableHead>
                <TableHead className="py-5 text-center font-medium text-slate-500 text-[14px] max-w-[300px]">Details</TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 6 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex} className="py-5">
                        <Skeleton className="mx-auto h-4 w-24" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : quoteQuery.isError ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-36 text-center text-sm text-red-600">
                    <p>{quoteQuery.error instanceof Error ? quoteQuery.error.message : "Unable to load quote requests."}</p>
                    <button type="button" onClick={() => quoteQuery.refetch()} className="mt-2 font-semibold hover:underline">Try again</button>
                  </TableCell>
                </TableRow>
              ) : requestsData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-36 text-center text-sm text-slate-500">
                    No pending quote requests found.
                  </TableCell>
                </TableRow>
              ) : requestsData.map((item, index) => {
                const createdAt = formatQuoteDate(item.createdAt);
                return (
                <TableRow
                  key={item._id}
                  className={`border-b border-gray-100 hover:bg-slate-50/50 transition-colors ${
                    index === requestsData.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  <TableCell className="py-5 text-center text-[14px] text-slate-600 font-normal">
                    {item.name}
                  </TableCell>
                  <TableCell className="py-5 text-center text-[14px] text-slate-600 font-normal">
                    {item.email}
                  </TableCell>
                  <TableCell className="py-5 text-center text-[14px] text-slate-600 font-normal">
                    {item.phoneNumber}
                  </TableCell>
                  <TableCell className="py-5 text-center text-[14px] text-slate-600 font-normal">
                    <div className="flex flex-col items-center justify-center leading-tight">
                      <span>{createdAt.date}</span>
                      <span className="text-xs text-slate-400 mt-0.5">{createdAt.time}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 text-center text-[14px] text-slate-600 font-normal">
                    {item.serviceNeeded}
                  </TableCell>
                  <TableCell className="py-5 text-center text-[14px] text-slate-500 font-normal max-w-[300px] whitespace-normal leading-relaxed">
                    {item.projectDetails}
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
