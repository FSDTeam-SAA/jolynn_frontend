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
import { Edit, Phone, MapPin, Mail } from "lucide-react";
import DashboardPagination from "../../_component/shared/pagination";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { DeleteContactInfo } from "./delete-contact-info";
import { useSession } from "next-auth/react";

interface ContactInfo {
  _id: string;
  address: string;
  email: string;
  openingHours: string;
  phoneNumbers: string[];
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalContacts: number;
  itemsPerPage: number;
}

interface ContactInfoResponse {
  status: boolean;
  message: string;
  data: ContactInfo[];
  pagination: Pagination;
}

export const ContactInfoTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const session = useSession();
  const token = (session?.data?.user as { token: string })?.token;

  const { data: allContactInfo, isLoading } = useQuery<ContactInfoResponse>({
    queryKey: ["all-contact-info", currentPage],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contact-info?page=${currentPage}&limit=10`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch contact info");
      return res.json();
    },
    enabled: !!token,
  });

  const contactInfos = allContactInfo?.data ?? [];
  const pagination = allContactInfo?.pagination;

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-gray-200 pb-5">
        <Table className="border-b border-gray-200">
          <TableHeader className="bg-primary/20 py-5 rounded-lg">
            <TableRow>
              <TableHead className="py-6 text-black/85 text-center">
                Address
              </TableHead>
              <TableHead className="py-6 text-black/85 text-center">
                Email
              </TableHead>
              <TableHead className="py-6 text-black/85 text-center">
                Phone Numbers
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
                    <Skeleton className="h-5 w-[180px] mx-auto" />
                  </TableCell>
                  <TableCell className="py-6 text-center">
                    <Skeleton className="h-5 w-[150px] mx-auto" />
                  </TableCell>
                  <TableCell className="py-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : contactInfos.length > 0 ? (
              contactInfos.map((contact) => (
                <TableRow
                  key={contact._id}
                  className="text-black/70 text-center hover:bg-muted/30"
                >
                  <TableCell className="py-6">
                    <div className="flex items-center justify-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="max-w-[200px] truncate">
                        {contact?.address}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      {contact?.email}
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="flex items-center justify-center gap-2">
                      <ul>
                        {contact?.phoneNumbers?.map((number, index) => (
                          <li key={index} className="flex items-center gap-2">
                            {" "}
                            <Phone className="h-4 w-4 text-primary" />
                            {number}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="space-x-2 flex justify-center">
                      <Link
                        href={`/dashboard/contact-info/add-contact-info/edit-contact-info/${contact?._id}`}
                      >
                        <button>
                          <Edit className="h-5 w-5" />
                        </button>
                      </Link>
                      <div>
                        <DeleteContactInfo id={contact?._id} />
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
                  No contact information found.
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
                  contactInfos.length}{" "}
                of {pagination.totalContacts} results
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
