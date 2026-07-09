import React from "react";
import { AppTopBar } from "../_component/shared/app-topbar";
import TermsService from "./_components/terms-service";

const page = () => {
  return (
    <div>
      <div className="mb-10 mt-10">
        <AppTopBar />
      </div>

      <div>
        <TermsService />
      </div>
    </div>
  );
};

export default page;
