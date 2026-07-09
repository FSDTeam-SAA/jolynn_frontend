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
import { Eye, Download } from "lucide-react";
import DashboardPagination from "../../_component/shared/pagination";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { ViewReferralModal } from "./view-referral-modal";
import { DeleteReferral } from "./delete-referral";

type Patient = {
  name: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
};

type Dentist = {
  name: string;
  practice: string;
  phoneNumber: string;
  email: string;
};

type UploadedFile = {
  public_id: string;
  fileUrl: string;
  _id: string;
};

type Referral = {
  _id: string;
  patient: Patient;
  dentist: Dentist;
  additionalNotes: string;
  uploadedFiles: UploadedFile[];
  consentGiven: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type Pagination = {
  currentPage: number;
  totalPages: number;
  totalReferrals: number;
  itemsPerPage: number;
};

export type ReferralsResponse = {
  status: boolean;
  message: string;
  data: Referral[];
  pagination: Pagination;
};

export const ReferralTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [referralID, setReferralID] = useState("");
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(
    null
  );

  const session = useSession();
  const token = (session?.data?.user as { token: string })?.token;

  const { data: allReferrals, isLoading } = useQuery<ReferralsResponse>({
    queryKey: ["all-referrals", currentPage],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/referrals?page=${currentPage}&limit=10`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch referrals");
      return res.json();
    },
    enabled: !!token,
  });

  const referrals = allReferrals?.data || [];
  const pagination = allReferrals?.pagination;

  const handleViewReferral = (referral: Referral) => {
    setSelectedReferral(referral);
    setIsOpen(true);
  };

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.target = "_blank";
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const skeletonRows = Array.from({ length: 10 });

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 pb-5">
      <Table className="border-b border-gray-200">
        <TableHeader className="bg-primary/20 py-5 rounded-lg">
          <TableRow>
            <TableHead className="py-6 text-black/85 text-center">
              Patient
            </TableHead>
            <TableHead className="py-6 text-black/85 text-center">
              Date of Birth
            </TableHead>
            <TableHead className="py-6 text-black/85 text-center">
              Contact
            </TableHead>
            <TableHead className="py-6 text-black/85 text-center">
              Referring Dentist
            </TableHead>
            <TableHead className="py-6 text-black/85 text-center">
              Practice
            </TableHead>
            <TableHead className="py-6 text-black/85 text-center">
              Referral Date
            </TableHead>
            <TableHead className="py-6 text-black/85 text-center">
              Files
            </TableHead>
            <TableHead className="py-6 text-black/85 text-center">
              Actions
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
                  <Skeleton className="mx-auto h-5 w-24" />
                </TableCell>
                <TableCell className="py-5">
                  <Skeleton className="mx-auto h-5 w-32" />
                </TableCell>
                <TableCell className="py-5">
                  <Skeleton className="mx-auto h-5 w-28" />
                </TableCell>
                <TableCell className="py-5">
                  <Skeleton className="mx-auto h-5 w-32" />
                </TableCell>
                <TableCell className="py-5">
                  <Skeleton className="mx-auto h-5 w-24" />
                </TableCell>
                <TableCell className="py-5">
                  <Skeleton className="mx-auto h-5 w-20" />
                </TableCell>
                <TableCell className="py-5">
                  <div className="flex justify-center space-x-2">
                    <Skeleton className="h-5 w-5 rounded" />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : referrals.length > 0 ? (
            referrals.map((referral) => (
              <TableRow
                key={referral._id}
                className="text-black/60 text-center"
              >
                <TableCell className="py-6">
                  <div className="text-center">
                    <div className="font-medium">{referral.patient.name}</div>
                    <div className="text-sm text-gray-500">
                      {referral.patient.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <div className="text-center">
                    <div>{formatDate(referral.patient.dateOfBirth)}</div>
                    <div className="text-sm text-gray-500">
                      Age: {calculateAge(referral.patient.dateOfBirth)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <div className="text-center">
                    <div>{referral.patient.phoneNumber}</div>
                    <div className="text-sm text-gray-500">
                      {referral.patient.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <div className="text-center">
                    <div>{referral.dentist.name}</div>
                    <div className="text-sm text-gray-500">
                      {referral.dentist.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  {referral.dentist.practice}
                </TableCell>
                <TableCell className="py-6">
                  {formatDate(referral.createdAt)}
                </TableCell>
                <TableCell className="py-6">
                  <div className="flex flex-col items-center space-y-1">
                    {referral.uploadedFiles.length > 0 ? (
                      referral.uploadedFiles.map((file, index) => (
                        <button
                          key={file._id}
                          onClick={() =>
                            handleDownloadFile(
                              file.fileUrl,
                              `referral-file-${index + 1}`
                            )
                          }
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <Download className="h-3 w-3" />
                          <span>File {index + 1}</span>
                        </button>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">No files</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <div className="flex justify-center items-center space-x-2">
                    <div>
                      <button
                        onClick={() => {
                          handleViewReferral(referral);
                          setReferralID(referral?._id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="View Referral Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>

                    <div>
                      <DeleteReferral id={referral?._id} />
                    </div>
                  </div>
                </TableCell>

                <div>
                  {/* View Referral Modal - You'll need to implement this component */}
                  {isOpen && selectedReferral && (
                    <ViewReferralModal
                      isOpen={isOpen}
                      onClose={() => setIsOpen(false)}
                      id={referralID}
                    />
                  )}
                </div>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="py-6 text-center text-black/50">
                No referrals found
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
              {referrals.length > 0
                ? (currentPage - 1) * pagination.itemsPerPage + 1
                : 0}
              –
              {Math.min(
                currentPage * pagination.itemsPerPage,
                pagination.totalReferrals
              )}{" "}
              of {pagination.totalReferrals} results
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
