'use client'
import React, { useEffect } from "react";

const Page = () => {
  useEffect(() => {
    window.location.href = "/dashboard/faq";
  }, []);

  return <div></div>;
};

export default Page;
