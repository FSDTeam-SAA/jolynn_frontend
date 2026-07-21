"use client";

import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

const reportFormContent = {
  title: "Report to Admin",
  description: "Fill out the form below and we will get back to you soon",
  image: "/assets/images/report.jpg",
  imageAlt: "Business newspaper pages",
  field: {
    id: "reportMessage",
    label: "Report Message",
    placeholder: "Write your message here...",
  },
  submitLabel: "Report",
};

type ReportPayload = {
  businessId: string;
  message: string;
};

type ReportResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: ReportPayload & {
    _id: string;
    userId: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
  };
};

type ReportContainerProps = {
  businessId: string;
};

const ReportContainer = ({ businessId }: ReportContainerProps) => {
  const { data: session, status } = useSession();
  const sessionUser = session?.user as
    | { token?: string; accessToken?: string }
    | undefined;
  const token = sessionUser?.accessToken ?? sessionUser?.token;
  const [message, setMessage] = useState("");

  const { mutate, isPending } = useMutation<
    ReportResponse,
    Error,
    ReportPayload
  >({
    mutationKey: ["submit-business-report"],
    mutationFn: async (payload: ReportPayload) => {
      if (!token) throw new Error("Please sign in to submit a report.");
      if (!payload.businessId) throw new Error("A business must be selected.");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error("The report service is not configured.");

      const res = await fetch(`${apiUrl}/report`, {
        method: "POST",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as ReportResponse;

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Report submission failed");
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Report submitted successfully");
      setMessage("");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!message.trim()) {
      toast.error("Please write your report message.");
      return;
    }

    if (!businessId) {
      toast.error("No business was selected for this report.");
      return;
    }

    if (!token) {
      toast.error("Please sign in to submit a report.");
      return;
    }

    mutate({
      businessId,
      message: message.trim(),
    });
  };

  return (
    <section className="bg-white px-3 py-12 md:py-16 lg:px-8 lg:py-20">
      <div className="container">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-28">
          <div className="mx-auto w-full">
              <Image
                src={reportFormContent.image}
                alt={reportFormContent.imageAlt}
                width={1000}
                height={1000}
                className="object-cover w-[534px] h-[350px] md:h-[420px] lg:h-[500px]  rounded-[24px]"
              />
          </div>

          <div className="mx-auto w-full max-w-[630px] lg:mx-0">
            <h1 className="text-[34px] font-extrabold leading-tight text-primary sm:text-[40px] lg:text-[44px]">
              {reportFormContent.title}
            </h1>
            <p className="mt-3 text-[11px] font-medium text-[#7D7D7D] sm:text-[12px]">
              {reportFormContent.description}
            </p>
            {!businessId && (
              <p role="alert" className="mt-3 text-[12px] font-semibold text-red-600">
                No business selected. Please open this page from a business profile.
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-8">
              <label
                htmlFor={reportFormContent.field.id}
                className="text-[12px] font-semibold text-[#343A40]"
              >
                {reportFormContent.field.label}
              </label>
              <textarea
                id={reportFormContent.field.id}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={reportFormContent.field.placeholder}
                className="mt-2 min-h-[230px] w-full resize-none rounded-[4px] border border-[#C0C3C1] bg-white px-4 py-3 text-[12px] font-medium text-[#292D73] outline-none transition placeholder:text-[#8A8F99] focus:border-[#292D73] focus:ring-2 focus:ring-[#292D73]/15"
              />

              <button
                type="submit"
                disabled={isPending || status === "loading" || !businessId}
                className="mt-6 h-10 w-full rounded-[3px] bg-[#292D73] text-[12px] font-extrabold text-white transition hover:bg-[#20255F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPending ? "Reporting..." : reportFormContent.submitLabel}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReportContainer;
