import React from "react";
import { BookingsTable } from "./_component/dashboard/bookings-table";
import { AppTopBar } from "./_component/shared/app-topbar";

const page = () => {
  return (
    <div>
      <div className="mb-10 mt-10">
        <AppTopBar />
      </div>
      
      <div>
        <BookingsTable />
      </div>
    </div>
  );
};

export default page;
