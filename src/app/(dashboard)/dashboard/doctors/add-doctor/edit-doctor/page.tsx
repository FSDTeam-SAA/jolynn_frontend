"use client";
import React, { useEffect } from "react";

const Page = () => {
  useEffect(() => {
    window.location.href = "/dashboard/teams";
  }, []);

  return <div></div>;
};

export default Page;
