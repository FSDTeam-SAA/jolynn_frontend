"use client";
import { useQuery } from "@tanstack/react-query";
import React from "react";

const PrivacyPolicy = () => {
  const { data = {} } = useQuery({
    queryKey: ["privacy-policy"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/privacy-policy`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      return data?.data;
    },
  });

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold">Privacy Policy</h1>
      </div>

      <div
        className="p-5 border border-gray-300 rounded-lg mt-8"
        dangerouslySetInnerHTML={{ __html: data?.policyContent }}
      ></div>
    </div>
  );
};

export default PrivacyPolicy;
