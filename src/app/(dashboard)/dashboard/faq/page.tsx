import React from "react";
import { AppTopBar } from "../_component/shared/app-topbar";
import { FaqTable } from "./_components/faq-table";

const page = () => {
  return (
    <div>
      <div className="mb-10 mt-10">
        <AppTopBar />
      </div>

      <div>
        <FaqTable />
      </div>
    </div>
  );
};

export default page;
