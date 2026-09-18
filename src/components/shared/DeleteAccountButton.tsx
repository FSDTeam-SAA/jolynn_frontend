"use client";

import { useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import DeleteModal from "@/components/modals/delete-modal";

export default function DeleteAccountButton({
  business = false,
  className,
}: {
  business?: boolean;
  className?: string;
}) {
  const { data: session, update: updateSession } = useSession();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const inFlight = useRef(false);
  const user = session?.user as
    | { role?: string; accessToken?: string; token?: string }
    | undefined;
  const token = user?.accessToken ?? user?.token;
  const expectedRole = business ? "businessOwner" : "user";

  const deleteAccount = async () => {
    if (!isConfirmOpen || inFlight.current || !token) return;
    if (!business && user?.role !== expectedRole) {
      toast.error(`Please switch to your ${business ? "business" : "personal"} profile before deleting it.`);
      return;
    }
    inFlight.current = true;
    setIsDeleting(true);
    let accountDeleted = false;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error("The account service is not configured.");
      let deletionToken = token;
      if (business) {
        // The backend deletes the profile identified by the token, not the page.
        const switchResponse = await fetch(`${apiUrl.replace(/\/$/, "")}/auth/switch-profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ targetRole: "businessOwner" }),
        });
        const switched = await switchResponse.json().catch(() => null);
        const businessToken = switched?.data?.accessToken ?? switched?.data?.token;
        if (!switchResponse.ok || switched?.success === false || !businessToken) {
          throw new Error(
            switched?.message || "Unable to verify your business profile. Please sign in again.",
          );
        }
        deletionToken = businessToken;
        await updateSession({
          user: {
            role: "businessOwner",
            token: businessToken,
            accessToken: businessToken,
          },
        });
      }
      const response = await fetch(`${apiUrl.replace(/\/$/, "")}/user/profile`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${deletionToken}` },
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success === false) {
        throw new Error(
          typeof result?.message === "string"
            ? result.message
            : "Could not delete your account. Please try again.",
        );
      }
      accountDeleted = true;
      // Clear the auth session before leaving, then discard the dashboard page.
      const logout = signOut({ redirect: false, callbackUrl: "/" });
      queryClient.clear();
      await logout;
      window.location.replace("/");
    } catch (error) {
      if (accountDeleted) {
        // Offer NextAuth's sign-out page if the session request failed.
        window.location.replace("/api/auth/signout?callbackUrl=%2F");
      } else {
        toast.error(error instanceof Error ? error.message : "Could not delete your account.");
      }
    } finally {
      if (!accountDeleted) {
        inFlight.current = false;
        setIsDeleting(false);
      }
    }
  };

  return (
    <>
    <button
      type="button"
      onClick={() => setIsConfirmOpen(true)}
      disabled={isDeleting || !token}
      className={cn(
        "flex h-11 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3 text-sm font-semibold text-red-500 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      <Trash2 className="h-[17px] w-[17px]" />
      {isDeleting ? "Deleting..." : "Delete Account"}
    </button>
    <DeleteModal
      isOpen={isConfirmOpen}
      onClose={() => {
        if (!inFlight.current) setIsConfirmOpen(false);
      }}
      onConfirm={() => void deleteAccount()}
      isDeleting={isDeleting}
      confirmLabel="Confirm"
      title={`Delete ${business ? "Business" : "Personal"} Profile?`}
      desc={`Your ${business ? "business" : "personal"} profile and all its related data will be permanently deleted. If this is your only profile, your account will also be deleted. You will be signed out. This cannot be undone.`}
    />
    </>
  );
}
