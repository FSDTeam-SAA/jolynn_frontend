/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Spinner } from "@/components/ui/spinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import { useSession } from "next-auth/react";
import React from "react";
import { toast } from "sonner";

export const DeletePriceList = ({ id }: { id: string }) => {
  const queryClient = useQueryClient();
  const session = useSession();
  const token = (session?.data?.user as { token: string })?.token;

  const { mutateAsync, isPending } = useMutation<any, Error, string>({
    mutationKey: ["delete-price-list"],
    mutationFn: async (id: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/treatmentfees/${id}`,
        {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message);
      queryClient.invalidateQueries({ queryKey: ["all-price-list"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = async (id: string) => {
    try {
      await mutateAsync(id);
    } catch (error) {
      console.log(`error from bookings delete : ${error}`);
    }
  };

  return (
    <button onClick={() => handleDelete(id)}>
      {isPending ? <Spinner /> : <Trash className="h-5 w-5" />}
    </button>
  );
};
