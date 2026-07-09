import React from "react";
import { AppTopBar } from "../_component/shared/app-topbar";
import { ContactInfoTable } from "./_components/contact-info-table";

const page = () => {
  return (
    <div>
      <div className="mb-10 mt-10">
        <AppTopBar />
      </div>

      <div>
        <ContactInfoTable />
      </div>
    </div>
  );
};

export default page;
