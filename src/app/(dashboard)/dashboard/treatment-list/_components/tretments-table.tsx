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
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { DeleteTreatment } from "./delete-treatment";

type Treatment = {
  _id: string;
  title: string;
  serviceName: string;
  description: string;
  image: string;
  cloudinaryId: string;
  category: {
    _id: string;
    name: string;
    image: string;
  };
  createdAt: string;
  updatedAt: string;
};

type PaginationType = {
  totalPages: number;
  totalTreatments: number;
};

type TreatmentResponse = {
  data: Treatment[];
  pagination: PaginationType;
};

export const TreatmentsTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const session = useSession();
  const token = (session?.data?.user as { token: string })?.token;

  const { data: treatmentsData, isLoading } = useQuery<TreatmentResponse>({
    queryKey: ["all-treatments", currentPage],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/treatments?page=${currentPage}&limit=10`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch treatments");
      return res.json();
    },
    enabled: !!token,
  });

  const treatments = treatmentsData?.data || [];
  const pagination = treatmentsData?.pagination;

  // Function to strip HTML tags from description for table display
  const stripHtml = (html: string) => {
    if (typeof window !== "undefined") {
      const tmp = document.createElement("DIV");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    }
    return html.replace(/<[^>]*>/g, "");
  };

  // Function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-gray-200 pb-5">
        <Table className="border-b border-gray-200">
          <TableHeader className="bg-primary/20">
            <TableRow>
              <TableHead className="py-5 text-black/85 text-start">
                Service Name & Image
              </TableHead>
              <TableHead className="py-5 text-black/85 text-start">
                Category
              </TableHead>
              <TableHead className="py-5 text-black/85 text-start">
                Description
              </TableHead>
              <TableHead className="py-5 text-black/85 text-start">
                Date
              </TableHead>
              <TableHead className="py-5 text-black/85 text-start">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell className="py-6 text-start">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-[80px] w-[100px] rounded-lg" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </TableCell>
                  <TableCell className="py-6 text-start">
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell className="py-6 text-start">
                    <Skeleton className="h-5 w-48" />
                  </TableCell>
                  <TableCell className="py-6 text-start">
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell className="py-6 text-start">
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && treatments.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-black/50 text-sm"
                >
                  No treatments found.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              treatments.map((treatment) => (
                <TableRow key={treatment._id} className="text-black/70">
                  <TableCell className="py-6 text-start">
                    <div className="flex items-center gap-3">
                      <Image
                        src={
                          treatment.image || "/assets/images/placeholder.png"
                        }
                        alt={treatment.serviceName}
                        width={1000}
                        height={1000}
                        className="h-[80px] w-[100px] object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-semibold text-black">
                          {treatment.serviceName}
                        </h3>
                        {treatment.title && (
                          <p className="text-sm text-gray-500 mt-1">
                            {treatment.title}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-6 text-start">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {treatment.category?.name || "Uncategorized"}
                    </span>
                  </TableCell>

                  <TableCell className="py-6 text-start">
                    <div
                      className="max-w-lg line-clamp-2"
                      title={stripHtml(treatment.description)}
                    >
                      {truncateText(stripHtml(treatment.description), 100)}
                    </div>
                  </TableCell>

                  <TableCell className="py-6 text-start">
                    {new Date(treatment.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>

                  <TableCell className="py-6 text-start">
                    <div className="flex items-center gap-2">
                      {/* Edit Button */}
                      <Link
                        href={`/dashboard/treatment-list/add-treatment/edit-treatment/${treatment._id}`}
                      >
                        <button>
                          <Edit className="h-4 w-4" />
                        </button>
                      </Link>

                      <div>
                        <DeleteTreatment id={treatment._id} />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        {pagination && !isLoading && treatments.length > 0 && (
          <div className="px-5 pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm md:text-base text-black/60">
                Showing {(currentPage - 1) * 10 + 1} to{" "}
                {Math.min(currentPage * 10, pagination.totalTreatments)} of{" "}
                {pagination.totalTreatments} results
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
