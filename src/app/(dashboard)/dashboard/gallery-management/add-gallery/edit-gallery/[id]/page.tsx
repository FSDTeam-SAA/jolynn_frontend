"use client";
export const dynamic = "force-dynamic";
import { AppTopBar } from "@/app/(dashboard)/dashboard/_component/shared/app-topbar";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import AddEditGallery from "../../_components/add-edit-gallery";


const Page = () => {
  const { id } = useParams();

  const { data: galleryDetails = {} } = useQuery({
    queryKey: ["all-gallery"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/galleries/${id}`, {
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
        <AddEditGallery id={id as string} galleryDetails={galleryDetails} />
      </div>
    </div>
  );
};

export default Page;
