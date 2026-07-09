'use client'
import React, { useEffect } from "react";

const Page = () => {
  useEffect(() => {
    window.location.href = "/dashboard/contact-info";
  }, []);

  return <div></div>;
};

export default Page;
