import React from "react";
import { AppTopBar } from "../_component/shared/app-topbar";
import { ContactsTable } from "./_components/contacts-table";

const page = () => {
  return (
    <div>
      <div className="mb-10 mt-10">
        <AppTopBar />
      </div>

      <div>
        <ContactsTable />
      </div>
    </div>
  );
};

export default page;
