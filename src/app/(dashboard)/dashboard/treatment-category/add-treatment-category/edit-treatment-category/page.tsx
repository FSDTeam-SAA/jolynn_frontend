"use client";
import React, { useEffect } from "react";

const Page = () => {
  useEffect(() => {
    window.location.href = "/dashboard/treatment-category";
  }, []);

  return <div></div>;
};

export default Page;
