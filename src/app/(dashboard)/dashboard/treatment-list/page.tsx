import React from "react";
import { AppTopBar } from "../_component/shared/app-topbar";
import { TreatmentsTable } from "./_components/tretments-table";

const page = () => {
  return (
    <div>
      <div className="mb-10 mt-10">
        <AppTopBar />
      </div>

      <div>
        <TreatmentsTable />
      </div>
    </div>
  );
};

export default page;
