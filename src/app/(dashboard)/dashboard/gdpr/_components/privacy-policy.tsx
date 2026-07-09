"use client";
import { useQuery } from "@tanstack/react-query";
import React from "react";

const Gdpr = () => {
  const { data = {} } = useQuery({
    queryKey: ["gdpr"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gdpr`,
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
        <h1 className="text-2xl font-semibold">GDPR</h1>
      </div>

      <div
        className="p-5 border border-gray-300 rounded-lg mt-8"
        dangerouslySetInnerHTML={{ __html: data?.gdprContent }}
      ></div>
    </div>
  );
};

export default Gdpr;
