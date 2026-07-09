"use client";
import { AppTopBar } from "@/app/(dashboard)/dashboard/_component/shared/app-topbar";
import { useQuery } from "@tanstack/react-query";
import EditGdpr from "./_components/add-edit-privacy-policy";

export const dynamic = "force-dynamic";

const Page = () => {
  const { data: gdpr = {} } = useQuery({
    queryKey: ["gdpr"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gdpr`,
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
        <EditGdpr gdpr={gdpr} />
      </div>
    </div>
  );
};

export default Page;
