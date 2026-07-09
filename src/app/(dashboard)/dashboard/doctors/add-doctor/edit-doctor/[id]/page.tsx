"use client";
import { AppTopBar } from "@/app/(dashboard)/dashboard/_component/shared/app-topbar";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import AddEditDoctors from "../../_components/add-edit-doctor";

export const dynamic = "force-dynamic";

const Page = () => {
  const { id } = useParams();
  const session = useSession();
  const token = (session?.data?.user as { token: string })?.token;

  const { data: doctorData = {} } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/doctors/${id}`,
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
        <AddEditDoctors id={id as string} doctorData={doctorData} />
      </div>
    </div>
  );
};

export default Page;
