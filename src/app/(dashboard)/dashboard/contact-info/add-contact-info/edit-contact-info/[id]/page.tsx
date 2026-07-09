"use client";
export const dynamic = "force-dynamic";
import { AppTopBar } from "@/app/(dashboard)/dashboard/_component/shared/app-topbar";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import AddEditContactInfo from "../../_components/add-edit-contact-form";

const Page = () => {
  const { id } = useParams();

  const { data: contactInfoData = {} } = useQuery({
    queryKey: ["all-contact-info"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact-info/${id}`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
      });
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
        <AddEditContactInfo id={id as string} contactInfoData={contactInfoData} />
      </div>
    </div>
  );
};

export default Page;
