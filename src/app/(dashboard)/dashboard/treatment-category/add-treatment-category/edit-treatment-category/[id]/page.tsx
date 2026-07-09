"use client";
export const dynamic = "force-dynamic";

import { useQuery } from "@tanstack/react-query";
import { AppTopBar } from "../../../../_component/shared/app-topbar";
import { AddEditTreatmentCategory } from "../../_components/add-edit-treatment-category";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

const Page = () => {
  const { id } = useParams();
  const session = useSession();
  const token = (session?.data?.user as { token: string })?.token;

  const { data: treatmentCategoryDetails = {} } = useQuery({
    queryKey: ["all-treatment-categories"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/treatmentCategories/${id}`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
             Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      return data?.data;
    },
  });

  return (
    <div>
      <div className="mb-10 mt-10">
        <AppTopBar />
      </div>

      <div>
        <AddEditTreatmentCategory
          categoryDetails={treatmentCategoryDetails}
          id={id as string}
        />
      </div>
    </div>
  );
};

export default Page;
