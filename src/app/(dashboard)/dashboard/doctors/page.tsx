import React from "react";
import { AppTopBar } from "../_component/shared/app-topbar";
import DoctorsTable from "./_components/doctors-table";

const page = () => {
  return (
    <div>
      <div className="mb-10 mt-10">
        <AppTopBar />
      </div>

      <div>
        <DoctorsTable />
      </div>
    </div>
  );
};

export default page;
