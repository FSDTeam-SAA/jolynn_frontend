import React from "react";
import { AppTopBar } from "../_component/shared/app-topbar";
import { ReferralTable } from "./_components/referral-table";

const page = () => {
  return (
    <div>
      <div className="mb-10 mt-10">
        <AppTopBar />
      </div>

      <div>
        <ReferralTable />
      </div>
    </div>
  );
};

export default page;
