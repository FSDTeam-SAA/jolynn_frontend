"use client";
export const dynamic = "force-dynamic";
import { AppTopBar } from "@/app/(dashboard)/dashboard/_component/shared/app-topbar";
import AddEditFaq from "../../_components/add-edit-faq";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";


const Page = () => {
  const { id } = useParams();

  const { data: faqDetails = {} } = useQuery({
    queryKey: ["all-faq"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/faqs/${id}`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
      });
      const data = await res.json();
      return data?.faq;
    },
  });

  return (
    <div>
      <div className="mb-10 mt-10">
        <AppTopBar />
      </div>

      <div>
        <AddEditFaq id={id as string} faqDetails={faqDetails} />
      </div>
    </div>
  );
};

export default Page;
