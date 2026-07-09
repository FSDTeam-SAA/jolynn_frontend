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
import { Edit, Euro, ChevronDown, ChevronRight } from "lucide-react";
import DashboardPagination from "../../_component/shared/pagination";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { DeletePriceList } from "./delete-price-list";
import Link from "next/link";
import { useSession } from "next-auth/react";

type PriceItem = {
  _id: string;
  serviceName: string;
  items: {
    description: string;
    rate: number;
  }[];
  currency: string;
};

type PaginationType = {
  totalPages: number;
  totalBookings: number;
};

type PriceResponse = {
  data: PriceItem[];
  pagination: PaginationType;
};

export const PriceTable = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const session = useSession();
  const token = (session?.data?.user as { token: string })?.token;

  const { data: allPriceList, isLoading } = useQuery<PriceResponse>({
    queryKey: ["all-price-list", currentPage],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/treatmentfees?page=${currentPage}&limit=10`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch price list");
      return res.json();
    },
    enabled: !!token,
  });

  const priceLists = allPriceList?.data || [];
  const pagination = allPriceList?.pagination;

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-gray-200 pb-5">
        <Table className="border-b border-gray-200">
          <TableHeader className="bg-primary/20">
            <TableRow>
              <TableHead className="py-5 text-start text-black/85">
                Service Name
              </TableHead>
              <TableHead className="py-5 text-start text-black/85">
                Number of Items
              </TableHead>
              <TableHead className="py-5 text-start text-black/85">
                Total Rate
              </TableHead>
              <TableHead className="py-5 text-start text-black/85">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading &&
              Array.from({ length: 10 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell className="py-6 text-start">
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell className="py-6 text-start">
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell className="py-6 text-start">
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell className="py-6 text-start">
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && priceLists.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-10 text-start text-black/50 text-sm"
                >
                  No price data found.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              priceLists.map((priceList) => {
                const totalRate = priceList.items.reduce(
                  (sum, item) => sum + item.rate,
                  0
                );
                const isExpanded = expandedRows.has(priceList._id);

                return (
                  <React.Fragment key={priceList._id}>
                    <TableRow className="text-black/70">
                      <TableCell className="py-6 text-start">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleRow(priceList._id)}
                            className="hover:text-primary transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                          {priceList.serviceName}
                        </div>
                      </TableCell>
                      <TableCell className="py-6 text-start">
                        {priceList.items.length} items
                      </TableCell>
                      <TableCell className="py-6 font-semibold text-start">
                        <div className="flex items-center gap-1">
                          <Euro className="h-4 w-4" />
                          {totalRate}
                        </div>
                      </TableCell>
                      <TableCell className="py-6 text-start">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/price-list/add-price-list/edit-price-list/${priceList._id}`}
                          >
                            <button className="hover:text-primary transition-colors">
                              <Edit className="h-5 w-5" />
                            </button>
                          </Link>
                          <div>
                            <DeletePriceList id={priceList._id} />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="bg-gray-50 p-4 text-start"
                        >
                          <div className="space-y-3">
                            {priceList.items.map((item, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-start border-b pb-3 last:border-b-0"
                              >
                                <div
                                  className="lg:max-w-xl"
                                  dangerouslySetInnerHTML={{
                                    __html: item.description || "",
                                  }}
                                />
                                <div className="flex items-center gap-1 font-medium min-w-20 text-black/70">
                                  <Euro className="h-4 w-4" />
                                  {item.rate}
                                </div>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
          </TableBody>
        </Table>

        {pagination && !isLoading && (
          <div className="px-5 pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm md:text-base text-black/60">
                Showing {priceLists.length > 0 ? 1 : 0}–{priceLists.length} of{" "}
                {pagination.totalBookings} results
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
