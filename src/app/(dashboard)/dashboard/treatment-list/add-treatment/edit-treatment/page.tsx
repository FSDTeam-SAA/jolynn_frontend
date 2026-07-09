"use client";
import React, { useEffect } from "react";

const Page = () => {
  useEffect(() => {
    window.location.href = "/dashboard/treatment-list";
  }, []);

  return <div></div>;
};

export default Page;
