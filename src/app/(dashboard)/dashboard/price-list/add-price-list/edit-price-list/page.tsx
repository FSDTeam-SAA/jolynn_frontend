'use client'
import React, { useEffect } from "react";

const Page = () => {
  useEffect(() => {
    window.location.href = "/dashboard/price-list";
  }, []);

  return <div></div>;
};

export default Page;
