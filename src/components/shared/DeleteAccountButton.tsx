"use client";

import { useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DeleteAccountButton({
  business = false,
  className,
}: {
  business?: boolean;
  className?: string;
}) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const inFlight = useRef(false);
  const user = session?.user as
    | { id?: string; accessToken?: string; token?: string }
    | undefined;
  const token = user?.accessToken ?? user?.token;

  const deleteAccount = async () => {
    if (inFlight.current || !token || (business && !user?.id)) return;
    inFlight.current = true;
    setIsDeleting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error("The account service is not configured.");
      const path = business ? encodeURIComponent(user!.id!) : "profile";
      const response = await fetch(`${apiUrl.replace(/\/$/, "")}/user/${path}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success === false) {
        throw new Error(
          typeof result?.message === "string"
            ? result.message
            : "Could not delete your account. Please try again.",
        );
      }
      toast.success(result?.message || "Account deleted successfully.");
      queryClient.clear();
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete your account.");
    } finally {
      inFlight.current = false;
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void deleteAccount()}
      disabled={isDeleting || !token || (business && !user?.id)}
      className={cn(
        "flex h-11 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3 text-sm font-semibold text-red-500 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      <Trash2 className="h-[17px] w-[17px]" />
      {isDeleting ? "Deleting..." : "Delete Account"}
    </button>
  );
}
