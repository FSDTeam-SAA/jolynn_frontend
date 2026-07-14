"use client";

import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { FormEvent, useState } from "react";
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

const ContactInformation = () => {
  const [formValues, setFormValues] =
    useState<ContactFormValues>(defaultFormValues);

  const { mutate, isPending } = useMutation({
    mutationKey: ["submit-contact-message"],
    mutationFn: async (values: ContactFormValues) => {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiUrl}/contact`, {
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
    onSuccess: (data) => {
      toast.success(data?.message || "Message submitted successfully");
      setFormValues(defaultFormValues);
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
  );
};

export default ContactInformation;
