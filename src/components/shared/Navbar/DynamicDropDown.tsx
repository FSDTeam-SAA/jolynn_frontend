"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
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

interface TreatmentsDropdownProps {
  textColor: string; // pass from Navbar to match theme (white/black)
}

const TreatmentsDropdown = ({ textColor }: TreatmentsDropdownProps) => {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<TreatmentCategoryResponse>({
    queryKey: ["treatments-categories"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/treatmentCategories`);
      return res.json();
    },
  });

  if (isLoading) return   <Skeleton className="h-6 w-[100px] bg-gray-300" />
  if (isError)
    return (
      <div className="bg-white py-10 text-black text-center font-medium">
        Error: {error?.message}
      </div>
    );

  const categories =
    data?.data?.map((cat) => ({
      label: cat?.name,
      link: `/treatments/${cat?._id}#treatment_content`,
    })) || [];

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center gap-1 p-2 px-4 text-base transition-all duration-300 ease-in-out ${textColor}`}
        >
          Treatments
          <ChevronDown className="w-4 h-4 mt-[2px]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-2 w-56 bg-white shadow-lg border rounded-lg overflow-hidden">
        {categories.length > 0 ? (
          categories.map((item, idx) => (
            <DropdownMenuItem key={idx} asChild>
              <Link
                href={item.link}
                className="block w-full px-3 py-2 text-sm hover:bg-gray-100 rounded-md cursor-pointer"
              >
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="p-3 text-sm text-gray-500">No treatments available</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TreatmentsDropdown;
