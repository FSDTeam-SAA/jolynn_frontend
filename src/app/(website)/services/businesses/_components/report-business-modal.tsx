"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

type ReportBusinessModalProps = {
  ownerId: string;
  businessName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ReportPayload = {
  ownerId: string;
  message: string;
};

type ReportResponse = {
  success: boolean;
  message?: string;
};

const ReportBusinessModal = ({
  ownerId,
  businessName,
  open,
  onOpenChange,
}: ReportBusinessModalProps) => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const sessionUser = session?.user as
    | { token?: string; accessToken?: string }
    | undefined;
  const token = sessionUser?.accessToken ?? sessionUser?.token;
  const currentQuery = searchParams.toString();
  const callbackUrl = currentQuery ? `${pathname}?${currentQuery}` : pathname;
  const signInUrl = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  useEffect(() => {
    if (!open) {
      setMessage("");
      setShowSignInPrompt(false);
    }
  }, [open]);

  const reportMutation = useMutation<ReportResponse, Error, ReportPayload>({
    mutationKey: ["submit-business-report"],
    mutationFn: async (payload) => {
      if (!token) throw new Error("Please sign in to submit a report.");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error("The report service is not configured.");

      const response = await fetch(`${apiUrl}/report`, {
        method: "POST",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ReportResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Report submission failed.");
      }

      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Report submitted successfully.");
      onOpenChange(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      toast.error("Please write your report message.");
      return;
    }

    if (!token) {
      setShowSignInPrompt(true);
      return;
    }

    reportMutation.mutate({ ownerId, message: trimmedMessage });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl border-0 p-0 shadow-2xl sm:w-full">
        <div className="border-b border-[#E8ECF2] bg-[#F7FAFC] px-5 py-5 pr-12 sm:px-6">
          <DialogHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <DialogTitle className="text-xl font-extrabold text-[#292D73] sm:text-2xl">
              Report business
            </DialogTitle>
            <DialogDescription className="pt-1 text-xs leading-5 text-[#667085] sm:text-sm">
              Tell us what went wrong with {businessName || "this business"}.
              Our team will review your report.
            </DialogDescription>
          </DialogHeader>
        </div>

        {showSignInPrompt ? (
          <div className="px-5 py-6 sm:px-6">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              You need to sign in before submitting a report.
            </div>
            <DialogFooter className="mt-5 gap-2 sm:space-x-0">
              <button
                type="button"
                onClick={() => setShowSignInPrompt(false)}
                className="h-10 rounded-md border border-[#D0D5DD] px-5 text-xs font-semibold text-[#475467] transition hover:bg-[#F5F7FA]"
              >
                Back
              </button>
              <Link
                href={signInUrl}
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#292D73] px-5 text-xs font-bold text-white transition hover:bg-[#20255F]"
              >
                Sign in
              </Link>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 py-6 sm:px-6">
            <label
              htmlFor="reported-business-name"
              className="text-sm font-semibold text-[#344054]"
            >
              Business name
            </label>
            <input
              id="reported-business-name"
              type="text"
              value={businessName || "Selected business"}
              readOnly
              aria-readonly="true"
              className="mt-2 h-11 w-full cursor-default rounded-lg border border-[#D7DEE8] bg-[#F6F8FB] px-3.5 text-sm font-semibold text-[#292D73] outline-none"
            />

            <label
              htmlFor="business-report-message"
              className="mt-5 block text-sm font-semibold text-[#344054]"
            >
              Report message
            </label>
            <textarea
              id="business-report-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Describe the issue clearly..."
              maxLength={1000}
              autoFocus
              className="mt-2 min-h-36 w-full resize-y rounded-lg border border-[#C9D1DC] bg-white px-3.5 py-3 text-sm leading-6 text-[#292D73] outline-none transition placeholder:text-[#98A2B3] focus:border-[#292D73] focus:ring-2 focus:ring-[#292D73]/15 sm:min-h-40"
            />
            <p className="mt-1.5 text-right text-[11px] text-[#98A2B3]">
              {message.length}/1000
            </p>

            <DialogFooter className="mt-5 gap-2 sm:space-x-0">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={reportMutation.isPending}
                className="h-10 rounded-md border border-[#D0D5DD] px-5 text-xs font-semibold text-[#475467] transition hover:bg-[#F5F7FA] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  reportMutation.isPending ||
                  status === "loading" ||
                  !message.trim()
                }
                className="h-10 rounded-md bg-[#292D73] px-5 text-xs font-bold text-white transition hover:bg-[#20255F] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {reportMutation.isPending ? "Submitting..." : "Submit report"}
              </button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReportBusinessModal;
