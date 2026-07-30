"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Clock3 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const contactContent = {
  title: "Contact Us",
  description: "For better experience connect and contact with us",
  image: "/assets/images/contact-hero.jpg",
  imageAlt: "Hands joined together in a circle",
  formTitle: "Your Information",
  submitLabel: "Submit",
};

const contactFields = [
  {
    name: "firstName",
    placeholder: "First Name",
    type: "text",
  },
  {
    name: "lastName",
    placeholder: "Last Name",
    type: "text",
  },
  {
    name: "email",
    placeholder: "Email",
    type: "email",
  },
  {
    name: "phone",
    placeholder: "Phone Number",
    type: "tel",
  },
] as const;

type ContactFieldName = (typeof contactFields)[number]["name"];

type ContactFormValues = Record<ContactFieldName, string> & {
  message: string;
};

const defaultFormValues: ContactFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
};

type ProfileResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  };
};

const getApiUrl = () =>
  (
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5001/api/v1"
  ).replace(/\/$/, "");

const ContactInformation = () => {
  const { data: session } = useSession();
  const sessionUser = session?.user as
    | { accessToken?: string; token?: string }
    | undefined;
  const token = sessionUser?.accessToken ?? sessionUser?.token;
  const hasPrefilledProfile = useRef(false);
  const [formValues, setFormValues] =
    useState<ContactFormValues>(defaultFormValues);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const profileQuery = useQuery<ProfileResponse>({
    queryKey: ["contact-profile", token],
    enabled: Boolean(token),
    queryFn: async () => {
      if (!token) throw new Error("Session token is missing.");

      const response = await fetch(`${getApiUrl()}/user/profile`, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = (await response.json().catch(() => null)) as
        | ProfileResponse
        | null;

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to load your profile.");
      }

      return data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    const profile = profileQuery.data?.data;
    if (!profile || hasPrefilledProfile.current) return;

    setFormValues((current) => ({
      ...current,
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      email: profile.email ?? "",
      phone: profile.phoneNumber ?? "",
    }));
    hasPrefilledProfile.current = true;
  }, [profileQuery.data]);

  const { mutate, isPending } = useMutation({
    mutationKey: ["submit-contact-message"],
    mutationFn: async (values: ContactFormValues) => {
      const res = await fetch(`${getApiUrl()}/contact`, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Message submission failed");
      }

      return data;
    },
    onSuccess: () => {
      setFormValues((current) => ({ ...current, message: "" }));
      setIsSuccessModalOpen(true);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    },
  });

  const updateField = (name: keyof ContactFormValues, value: string) => {
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formValues.firstName.trim() || !formValues.email.trim()) {
      toast.error("Please add your first name and email.");
      return;
    }

    mutate(formValues);
  };

  return (
    <>
      <section className="relative min-h-[720px] overflow-hidden px-4 py-14 sm:px-6 md:py-20 lg:px-8">
      <Image
        src={contactContent.image}
        alt={contactContent.imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/55" />

      <div className="container relative z-10">
        <div className="mx-auto max-w-[760px] text-center text-white">
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-normal text-white">
            {contactContent.title}
          </h1>
          <p className="mt-3 text-xs md:text-sm xl:text-base font-normal leading-normal">
            {contactContent.description}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 w-full max-w-[735px] rounded-[8px] bg-white px-4 py-5 shadow-[0_14px_34px_rgba(0,0,0,0.24)] sm:px-5 md:mt-9"
        >
          <h2 className="text-center text-sm md:text-base leading-normal font-medium text-[#181919]">
            {contactContent.formTitle}
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {contactFields.map((field) => (
              <input
                key={field.name}
                type={field.type}
                value={formValues[field.name]}
                onChange={(event) =>
                  updateField(field.name, event.target.value)
                }
                placeholder={field.placeholder}
                className="h-10 rounded-[4px] border border-[#9CA3AF] px-4 text-[13px] font-medium text-[#292D73] outline-none transition placeholder:text-[#6B7280] focus:border-[#292D73] focus:ring-2 focus:ring-[#292D73]/15"
              />
            ))}
          </div>

          <textarea
            value={formValues.message}
            onChange={(event) => updateField("message", event.target.value)}
            placeholder="Any Message"
            className="mt-6 min-h-[145px] w-full resize-none rounded-[4px] border border-[#9CA3AF] px-4 py-4 text-[13px] font-medium text-[#292D73] outline-none transition placeholder:text-[#6B7280] focus:border-[#292D73] focus:ring-2 focus:ring-[#292D73]/15"
          />

          <button
            type="submit"
            disabled={isPending}
            className="mx-auto mt-5 flex h-11 w-full max-w-[260px] items-center justify-center rounded-[5px] bg-primary text-sm lg:text-base leading-normal font-semibold text-white transition hover:bg-[#20255F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? "Submitting..." : contactContent.submitLabel}
          </button>
        </form>
      </div>
      </section>

      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-[480px] overflow-hidden rounded-[20px] border-0 bg-white p-0 shadow-[0_30px_90px_rgba(16,24,40,0.30)]">
          <div className="relative bg-gradient-to-br from-[#292D73] via-[#354897] to-[#1683A4] px-6 pb-10 pt-9 text-center text-white">
            <div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/30 bg-white text-[#292D73] shadow-[0_12px_30px_rgba(0,0,0,0.20)]">
              <Check className="h-8 w-8 stroke-[3]" aria-hidden="true" />
            </div>
            <DialogTitle className="relative mt-5 text-[25px] font-extrabold leading-tight text-white">
              Message Sent Successfully
            </DialogTitle>
          </div>

          <div className="px-6 pb-7 pt-6 text-center sm:px-8">
            <DialogDescription className="text-[16px] font-bold leading-6 text-[#292D73]">
              Thank you for contacting us. We will reach out within 24 hours.
            </DialogDescription>
            <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-[#DDE5F0] bg-[#F7F9FC] px-4 py-3 text-[12px] font-medium text-[#667085]">
              <Clock3 className="h-4 w-4 shrink-0 text-[#4365D0]" />
              Our support team has received your message.
            </div>
            <DialogClose asChild>
              <button
                type="button"
                className="mt-6 h-11 w-full rounded-lg bg-[#292D73] text-sm font-extrabold text-white transition hover:bg-[#20255F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73] focus-visible:ring-offset-2"
              >
                Done
              </button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContactInformation;
