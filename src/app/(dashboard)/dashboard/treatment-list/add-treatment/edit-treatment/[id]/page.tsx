"use client";
export const dynamic = "force-dynamic";

import { useQuery } from "@tanstack/react-query";
import { AppTopBar } from "../../../../_component/shared/app-topbar";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { AddEditTreatmentForm } from "../../_components/add-edit-treatment-form";

const Page = () => {
  const { id } = useParams();
  const session = useSession();
  const token = (session?.data?.user as { token: string })?.token;

  const { data: treatmentDetails = {} } = useQuery({
    queryKey: ["all-treatments"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/treatments/${id}`,
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
        <AddEditTreatmentForm
          treatmentDetails={treatmentDetails}
          id={id as string}
        />
      </div>
    </div>
  );
};

export default Page;
