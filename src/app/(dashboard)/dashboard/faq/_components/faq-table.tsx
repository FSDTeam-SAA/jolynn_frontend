"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit } from "lucide-react";
import DashboardPagination from "../../_component/shared/pagination";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { DeleteFaq } from "./delete-faq";
import { useSession } from "next-auth/react";

interface Faq {
  _id: string;
  question: string;
  answer: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalFAQs: number;
  itemsPerPage: number;
}

interface FaqResponse {
  status: boolean;
  message: string;
  data: Faq[];
  pagination: Pagination;
}

export const FaqTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const session = useSession();
  const token = (session?.data?.user as { token: string })?.token;

  const { data: allFaq, isLoading } = useQuery<FaqResponse>({
    queryKey: ["all-faq", currentPage],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/faqs?page=${currentPage}&limit=10`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch FAQs");
      return res.json();
    },
    enabled: !!token
  });

  const faqs = allFaq?.data ?? [];
  const pagination = allFaq?.pagination;

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-gray-200 pb-5">
        <Table className="border-b border-gray-200">
          <TableHeader className="bg-primary/20 py-5 rounded-lg">
            <TableRow>
              <TableHead className="py-6 text-black/85 text-center">
                FAQ Question
              </TableHead>
              <TableHead className="py-6 text-black/85 text-center">
                FAQ Answer
              </TableHead>
              <TableHead className="py-6 text-black/85 text-center">
                Date
              </TableHead>
              <TableHead className="py-6 text-black/85 text-center">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i} className="text-center">
                  <TableCell className="py-6 text-center">
                    <Skeleton className="h-5 w-[200px] mx-auto" />
                  </TableCell>
                  <TableCell className="py-6 text-center">
                    <Skeleton className="h-5 w-[300px] mx-auto" />
                  </TableCell>
                  <TableCell className="py-6 text-center">
                    <Skeleton className="h-5 w-[100px] mx-auto" />
                  </TableCell>
                  <TableCell className="py-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : faqs.length > 0 ? (
              faqs.map((faq) => (
                <TableRow
                  key={faq._id}
                  className="text-black/70 text-center hover:bg-muted/30"
                >
                  <TableCell className="py-6">{faq?.question}</TableCell>
                  <TableCell className="py-6">
                    <div
                      dangerouslySetInnerHTML={{ __html: faq?.answer || "" }}
                      className="lg:max-w-xl mx-auto"
                    ></div>
                  </TableCell>
                  <TableCell className="py-6">
                    {new Date(faq.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="space-x-2 flex justify-center">
                      <Link
                        href={`/dashboard/faq/add-faq/edit-faq/${faq?._id}`}
                      >
                        <button>
                          <Edit className="h-5 w-5" />
                        </button>
                      </Link>
                      <div>
                        <DeleteFaq id={faq?._id} />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-10 text-gray-500"
                >
                  No FAQs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {pagination && (
          <div className="px-5 pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm md:text-base text-black/60">
                Showing{" "}
                {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}–
                {(pagination.currentPage - 1) * pagination.itemsPerPage +
                  faqs.length}{" "}
                of {pagination.totalFAQs} results
              </p>

              <div>
                <DashboardPagination
                  totalPages={pagination.totalPages}
                  currentPage={currentPage}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
