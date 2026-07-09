"use client";
import { AppTopBar } from "@/app/(dashboard)/dashboard/_component/shared/app-topbar";
import { useQuery } from "@tanstack/react-query";
import EditTermsService from "./_components/add-edit-privacy-policy";

export const dynamic = "force-dynamic";

const Page = () => {
  const { data: termsContent = {} } = useQuery({
    queryKey: ["terms-service"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/terms-service`,
        {
          method: "GET",
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
        <EditTermsService termsContent={termsContent} />
      </div>
    </div>
  );
};

export default Page;
