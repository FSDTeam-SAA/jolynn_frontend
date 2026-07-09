import React from "react";
import { AppTopBar } from "../_component/shared/app-topbar";
import { TreatmentCategoryTable } from "./_components/treatment-category-table";

const page = () => {
  return (
    <div>
      <div className="mb-10 mt-10">
        <AppTopBar />
      </div>

      <div>
        <TreatmentCategoryTable />
      </div>
    </div>
  );
};

export default page;
