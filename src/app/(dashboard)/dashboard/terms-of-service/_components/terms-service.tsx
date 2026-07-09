"use client";
import { useQuery } from "@tanstack/react-query";
import React from "react";

const TermsService = () => {
  const { data = {} } = useQuery({
    queryKey: ["terms-service"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/terms-service`,
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
        <h1 className="text-2xl font-semibold">Terms of Service</h1>
      </div>

      <div
        className="p-5 border border-gray-300 rounded-lg mt-8"
        dangerouslySetInnerHTML={{ __html: data?.termsContent }}
      ></div>
    </div>
  );
};

export default TermsService;
