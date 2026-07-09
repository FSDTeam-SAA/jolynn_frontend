// components/dashboard/treatment-category/treatment-category-table.tsx
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
import { useSession } from "next-auth/react";
import { DeleteTreatmentCategory } from "./delete-treatment-category";
import Image from "next/image";

type TreatmentCategory = {
  _id: string;
  name: string;
  image: string;
  createdAt: string;
  updatedAt: string;
};

type PaginationType = {
  totalPages: number;
  totalCategories: number;
};

type TreatmentCategoryResponse = {
  data: TreatmentCategory[];
  pagination: PaginationType;
};

export const TreatmentCategoryTable = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const session = useSession();
  const token = (session?.data?.user as { token: string })?.token;

  const { data: allCategories, isLoading } =
    useQuery<TreatmentCategoryResponse>({
      queryKey: ["all-treatment-categories", currentPage],
      queryFn: async () => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/treatmentCategories?page=${currentPage}&limit=10`,
          {
            method: "GET",
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch treatment categories");
        return res.json();
      },
      enabled: !!token,
    });

  const categories = allCategories?.data || [];
  const pagination = allCategories?.pagination;

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-gray-200 pb-5">
        <Table className="border-b border-gray-200">
          <TableHeader className="bg-primary/20">
            <TableRow>
              <TableHead className="py-5 text-center text-black/85">
                Category Name
              </TableHead>
              <TableHead className="py-5 text-center text-black/85">
                Image
              </TableHead>
              <TableHead className="py-5 text-center text-black/85">
                Created At
              </TableHead>
              <TableHead className="py-5 text-center text-black/85">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading &&
              Array.from({ length: 10 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell className="py-6 text-center">
                    <Skeleton className="h-5 w-32 mx-auto" />
                  </TableCell>
                  <TableCell className="py-6 text-center">
                    <Skeleton className="h-10 w-10 mx-auto rounded" />
                  </TableCell>
                  <TableCell className="py-6 text-center">
                    <Skeleton className="h-5 w-24 mx-auto" />
                  </TableCell>
                  <TableCell className="py-6 text-center">
                    <Skeleton className="h-5 w-16 mx-auto" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && categories.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-10 text-center text-black/50 text-sm"
                >
                  No treatment categories found.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              categories.map((category) => (
                <TableRow key={category._id} className="text-black/70">
                  <TableCell className="py-6 text-center">
                    {category.name}
                  </TableCell>
                  <TableCell className="py-6 text-center">
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={1000}
                      height={1000}
                      className="h-10 w-10 object-cover rounded mx-auto"
                    />
                  </TableCell>
                  <TableCell className="py-6 text-center">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="py-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/dashboard/treatment-category/add-treatment-category/edit-treatment-category/${category._id}`}
                      >
                        <button className="hover:text-primary transition-colors">
                          <Edit className="h-5 w-5" />
                        </button>
                      </Link>

                      <div>
                        <DeleteTreatmentCategory id={category._id} />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        {pagination && !isLoading && (
          <div className="px-5 pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm md:text-base text-black/60">
                Showing {categories.length > 0 ? 1 : 0}–{categories.length} of{" "}
                {pagination.totalCategories} results
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
