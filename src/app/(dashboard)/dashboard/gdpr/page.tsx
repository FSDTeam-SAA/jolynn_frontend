import React from "react";
import { AppTopBar } from "../_component/shared/app-topbar";
import Gdpr from "./_components/privacy-policy";

const page = () => {
  return (
    <div>
      <div className="mb-10 mt-10">
        <AppTopBar />
      </div>

      <div>
        <Gdpr />
      </div>
    </div>
  );
};

export default page;
