"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export interface TreatmentCategory {
  _id: string;
  name: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCategories: number;
  itemsPerPage: number;
}

export interface TreatmentCategoryResponse {
  status: boolean;
  message: string;
  data: TreatmentCategory[];
  pagination: Pagination;
}

interface MobileTreatmentsDropdownProps {
  closeSheet: () => void;
}

const MobileTreatmentsDropdown = ({ closeSheet }: MobileTreatmentsDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading, isError, error } = useQuery<TreatmentCategoryResponse>({
    queryKey: ["treatments-categories"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/treatmentCategories`);
      return res.json();
    },
  });

  if (isLoading) return <Skeleton className="h-6 w-[100px] bg-gray-300" />
  if (isError)
    return (
      <div className="bg-white py-4 text-center text-sm text-red-500 font-medium">
        Error: {error?.message}
      </div>
    );

  const treatmentCategories =
    data?.data?.map((cat) => ({
      label: cat?.name,
      link: `/treatments/${cat?._id}`,
    })) || [];

  return (
    <li>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full p-3 rounded-lg font-medium transition-all duration-300 hover:bg-[#f5f5f5]`}
      >
        <span>Treatments</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <ul className="pl-4 mt-2 space-y-2 border-l border-gray-200">
          {treatmentCategories.length > 0 ? (
            treatmentCategories.map((subItem, idx) => (
              <li key={idx}>
                <Link
                  href={subItem.link}
                  onClick={closeSheet}
                  className="block p-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  {subItem.label}
                </Link>
              </li>
            ))
          ) : (
            <li className="p-2 text-sm text-gray-500">No treatments available</li>
          )}
        </ul>
      )}
    </li>
  );
};

export default MobileTreatmentsDropdown;
