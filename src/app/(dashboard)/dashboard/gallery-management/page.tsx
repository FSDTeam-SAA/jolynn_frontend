import React from "react";
import { AppTopBar } from "../_component/shared/app-topbar";
import { GalleryManagementTable } from "./_components/gallery-management-table";

const page = () => {
  return (
    <div>
      <div className="mb-10 mt-10">
        <AppTopBar />
      </div>

      <div>
        <GalleryManagementTable />
      </div>
    </div>
  );
};

export default page;
