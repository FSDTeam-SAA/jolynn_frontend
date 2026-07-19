"use client";

import { useBusinessServices } from "@/hooks/use-business-profile-sections";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

type QuoteFieldName = "name" | "email" | "phone";

type QuoteFormState = Record<QuoteFieldName, string> & {
  service: string;
  details: string;
};

type QuoteFieldConfig = {
  name: QuoteFieldName;
  label: string;
  placeholder: string;
  type: "text" | "email" | "tel";
};

const quoteFormContent: {
  title: string;
  responseText: string;
  fields: QuoteFieldConfig[];
  serviceLabel: string;
  detailsLabel: string;
  detailsPlaceholder: string;
  cancelLabel: string;
  submitLabel: string;
} = {
  title: "Request a Quote",
  responseText: "usually responds within 2 hours",
  fields: [
    {
      name: "name",
      label: "Name",
      placeholder: "Type your name",
      type: "text",
    },
    {
      name: "email",
      label: "Email Address",
      placeholder: "Type your email",
      type: "email",
    },
    {
      name: "phone",
      label: "Phone Number",
      placeholder: "(512) 555-0000",
      type: "tel",
    },
  ],
  serviceLabel: "Service Needed *",
  detailsLabel: "Project Details *",
  detailsPlaceholder:
    "Describe your project, timeline, and any specific requirements...",
  cancelLabel: "Cancel",
  submitLabel: "Send Request",
};

type RequestAQuoteModalProps = {
  open: boolean;
  businessOwnerId: string;
  businessName: string;
  onClose: () => void;
};

const defaultFormValues: QuoteFormState = {
  name: "",
  email: "",
  phone: "",
  service: "",
  details: "",
};

const RequestAQuoteModal = ({
  open,
  businessOwnerId,
  businessName,
  onClose,
}: RequestAQuoteModalProps) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState(defaultFormValues);
  const {
    data: servicesData,
    isPending: servicesPending,
    isError: servicesError,
    refetch: refetchServices,
  } = useBusinessServices(businessOwnerId);
  const services = servicesData?.data ?? [];
  const sessionUser = session?.user as
    | { token?: string; accessToken?: string }
    | undefined;
  const token = sessionUser?.accessToken ?? sessionUser?.token;

  const { mutate, isPending } = useMutation({
    mutationKey: ["request-business-quote"],
    mutationFn: async (values: QuoteFormState) => {
      if (!token) throw new Error("Please sign in to request a quote.");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error("The quote API is not configured.");

      const res = await fetch(`${apiUrl}/qoute/my`, {
        method: "POST",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessOwnerId,
          name: values.name.trim(),
          email: values.email.trim(),
          phoneNumber: values.phone.trim(),
          serviceNeeded: values.service,
          projectDetails: values.details.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Quote request failed");
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Quote request sent successfully");
      setFormValues(defaultFormValues);
      queryClient.invalidateQueries({ queryKey: ["my-quote-requests"] });
      onClose();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    },
  });

  if (!open) return null;

  const updateField = (name: keyof QuoteFormState, value: string) => {
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !formValues.name.trim() ||
      !formValues.email.trim() ||
      !formValues.phone.trim() ||
      !formValues.service.trim() ||
      !formValues.details.trim()
    ) {
      toast.error("Please complete all required fields.");
      return;
    }

    mutate(formValues);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/55 px-4 py-6">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-[720px] rounded-[10px] bg-white px-5 py-7 shadow-[0_24px_60px_rgba(17,24,39,0.32)] sm:px-9"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-7 text-[#667085] transition hover:text-[#292D73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73]"
          aria-label="Close quote modal"
        >
          <X className="h-7 w-7" />
        </button>

        <div className="pr-10">
          <h2 className="text-[24px] font-extrabold leading-tight text-[#292D73] sm:text-[28px]">
            {quoteFormContent.title}
          </h2>
          <p className="mt-1 text-[13px] font-medium text-[#667085] sm:text-[15px]">
            {businessName} {quoteFormContent.responseText}
          </p>
        </div>

        <div className="mt-3 space-y-2">
          {quoteFormContent.fields.map((field) => (
            <label key={field.name} className="block">
              <span className="text-[18px] font-extrabold text-[#4365D0]">
                {field.label}
              </span>
              <input
                type={field.type}
                value={formValues[field.name]}
                onChange={(event) =>
                  updateField(field.name, event.target.value)
                }
                placeholder={field.placeholder}
                className="mt-2 h-12 w-full rounded-[8px] border border-[#D0D5DD] p-3 text-[16px] font-medium text-[#292D73] outline-none transition placeholder:text-[#7A7F8C] focus:border-[#4365D0] focus:ring-2 focus:ring-[#4365D0]/15"
              />
            </label>
          ))}

          <label className="block">
            <span className="text-[18px] font-extrabold text-[#4365D0]">
              {quoteFormContent.serviceLabel}
            </span>
            <select
              value={formValues.service}
              onChange={(event) => updateField("service", event.target.value)}
              disabled={servicesPending || servicesError}
              className="mt-2 h-12 w-full rounded-[8px] border border-[#D0D5DD] bg-white p-3 text-[16px] font-medium text-[#7A7F8C] outline-none transition focus:border-[#4365D0] focus:ring-2 focus:ring-[#4365D0]/15"
            >
              <option value="">
                {servicesPending
                  ? "Loading services..."
                  : servicesError
                    ? "Services unavailable"
                    : services.length === 0
                      ? "No services available"
                      : "Select"}
              </option>
              {services.map((service) => (
                <option key={service._id} value={service.title}>
                  {service.title}
                </option>
              ))}
            </select>
            {servicesError && (
              <button
                type="button"
                onClick={() => refetchServices()}
                className="mt-2 text-sm font-semibold text-red-600 hover:underline"
              >
                Unable to load services. Try again
              </button>
            )}
          </label>

          <label className="block">
            <span className="text-[18px] font-extrabold text-[#4365D0]">
              {quoteFormContent.detailsLabel}
            </span>
            <textarea
              value={formValues.details}
              onChange={(event) => updateField("details", event.target.value)}
              placeholder={quoteFormContent.detailsPlaceholder}
              className="mt-2 min-h-[150px] w-full resize-none rounded-[8px] border border-[#D0D5DD] p-3 text-[16px] font-medium text-[#292D73] outline-none transition placeholder:text-[#7A7F8C] focus:border-[#4365D0] focus:ring-2 focus:ring-[#4365D0]/15"
            />
          </label>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-[8px] border border-[#8A94A6] bg-white text-[18px] font-extrabold text-[#98A2B3] transition hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73]"
          >
            {quoteFormContent.cancelLabel}
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-12 items-center justify-center gap-3 rounded-[8px] bg-[#292D73] text-[18px] font-extrabold text-white transition hover:bg-[#20255F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Send className="h-6 w-6" />
            {isPending ? "Sending..." : quoteFormContent.submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestAQuoteModal;
