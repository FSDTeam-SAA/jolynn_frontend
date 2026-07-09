/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Eye } from "lucide-react";
import DashboardPagination from "../../_component/shared/pagination";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteContact } from "./delete-contact";
import { ViewContactModal } from "./view-contact-modal";
import { useSession } from "next-auth/react";

type Contact = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  updatedAt: string;
};

type Pagination = {
  currentPage: number;
  totalPages: number;
  totalContacts: number;
  itemsPerPage: number;
};

export type ContactsResponse = {
  status: boolean;
  message: string;
  data: Contact[];
  pagination: Pagination;
};

export const ContactsTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [contactId, setContactId] = useState("");

  const session = useSession();
  const token = (session?.data?.user as { token: string })?.token;

  const { data: allContacts, isLoading } = useQuery<ContactsResponse>({
    queryKey: ["all-contacts", currentPage],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contacts?page=${currentPage}&limit=10`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch contacts");
      return res.json();
    },
    enabled: !!token,
  });

  const contacts = allContacts?.data || [];
  const pagination = allContacts?.pagination;

  const skeletonRows = Array.from({ length: 10 });

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 pb-5">
      <Table className="border-b border-gray-200">
        <TableHeader className="bg-primary/20 py-5 rounded-lg">
          <TableRow>
            <TableHead className="py-6 text-black/85 text-center">
              Name
            </TableHead>
            <TableHead className="py-6 text-black/85 text-center">
              Email
            </TableHead>
            <TableHead className="py-6 text-black/85 text-center">
              Phone Number
            </TableHead>
            <TableHead className="py-6 text-black/85 text-center">
              Date
            </TableHead>
            <TableHead className="py-6 text-black/85 text-center">
              Message
            </TableHead>
            <TableHead className="py-6 text-black/85 text-center">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            skeletonRows.map((_, i) => (
              <TableRow key={i} className="text-center">
                <TableCell className="py-5">
                  <Skeleton className="mx-auto h-5 w-28" />
                </TableCell>
                <TableCell className="py-5">
                  <Skeleton className="mx-auto h-5 w-40" />
                </TableCell>
                <TableCell className="py-5">
                  <Skeleton className="mx-auto h-5 w-32" />
                </TableCell>
                <TableCell className="py-5">
                  <Skeleton className="mx-auto h-5 w-24" />
                </TableCell>
                <TableCell className="py-5">
                  <Skeleton className="mx-auto h-5 w-60" />
                </TableCell>
                <TableCell className="py-5">
                  <div className="flex justify-center space-x-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-5 w-5 rounded" />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : contacts.length > 0 ? (
            contacts.map((contact) => (
              <TableRow
                key={contact?._id}
                className="text-black/60 text-center"
              >
                <TableCell className="py-6">{contact?.name}</TableCell>
                <TableCell className="py-6">{contact?.email}</TableCell>
                <TableCell className="py-6">{contact?.phone}</TableCell>
                <TableCell className="py-6">
                  {new Date(contact?.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="py-6 lg:max-w-lg">
                  {contact?.message}
                </TableCell>
                <TableCell className="py-6">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => {
                        setContactId(contact?._id);
                        setIsOpen(true);
                      }}
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <DeleteContact id={contact?._id} />
                  </div>
                </TableCell>

                <div>
                  {isOpen && (
                    <ViewContactModal
                      isOpen={isOpen}
                      onClose={() => setIsOpen(false)}
                      id={contactId}
                    />
                  )}
                </div>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="py-6 text-center text-black/50">
                No contacts found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {pagination && (
        <div className="px-5 pt-5">
          <div className="flex items-center justify-between">
            <p className="text-sm md:text-base text-black/60">
              Showing {contacts.length > 0 ? 1 : 0}–{contacts.length} of{" "}
              {pagination.totalContacts} results
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
  );
};
