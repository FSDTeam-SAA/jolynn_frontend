import React from "react";
import { AppTopBar } from "../_component/shared/app-topbar";
import { PriceTable } from "./_components/price-table";

const page = () => {
  return (
    <div>
      <div className="mb-10 mt-10">
        <AppTopBar />
      </div>

      <div>
        <PriceTable />
      </div>
    </div>
  );
};

export default page;
