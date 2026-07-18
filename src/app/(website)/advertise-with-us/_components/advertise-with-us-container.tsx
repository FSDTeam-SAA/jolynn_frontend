"use client";

import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

const advertiseContent = {
  title: "Advertise With Us",
  description: "For better experience connect and contact with us",
  image: "/assets/images/contact-hero.jpg",
  imageAlt: "Hands joined together in a circle",
  formTitle: "Your Information",
  submitLabel: "Submit",
};

const advertiseFields = [
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

type AdvertiseFieldName = (typeof advertiseFields)[number]["name"];

type AdvertiseFormValues = Record<AdvertiseFieldName, string> & {
  message: string;
};

const defaultFormValues: AdvertiseFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
};

const AdvertiseWithUsContainer = () => {
  const [formValues, setFormValues] =
    useState<AdvertiseFormValues>(defaultFormValues);

  const { mutate, isPending } = useMutation({
    mutationKey: ["submit-advertise-message"],
    mutationFn: async (values: AdvertiseFormValues) => {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5006/api/v1";
      const res = await fetch(`${apiUrl}/advertise`, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          message: values.message.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Advertise request failed");
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Advertise request submitted");
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

  const updateField = (name: keyof AdvertiseFormValues, value: string) => {
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (Object.values(formValues).some((value) => !value.trim())) {
      toast.error("Please fill in all fields.");
      return;
    }

    mutate(formValues);
  };

  return (
    <section className="relative min-h-[680px] overflow-hidden px-2 py-14 md:py-20 lg:px-8">
      <Image
        src={advertiseContent.image}
        alt={advertiseContent.imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/55" />

      <div className="container relative z-10">
        <div className="mx-auto max-w-[760px] text-center text-white">
          <h1 className="text-[34px] font-extrabold leading-tight sm:text-[42px] lg:text-[50px]">
            {advertiseContent.title}
          </h1>
          <p className="mt-2 text-[13px] font-medium sm:text-[15px]">
            {advertiseContent.description}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 w-full max-w-[640px] rounded-[8px] bg-white px-4 py-5 shadow-[0_14px_34px_rgba(0,0,0,0.24)] sm:px-5 md:mt-9"
        >
          <h2 className="text-center text-[15px] font-semibold text-[#111827]">
            {advertiseContent.formTitle}
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {advertiseFields.map((field) => (
              <input
                key={field.name}
                type={field.type}
                value={formValues[field.name]}
                onChange={(event) =>
                  updateField(field.name, event.target.value)
                }
                placeholder={field.placeholder}
                required
                className="h-10 rounded-[4px] border border-[#9CA3AF] px-3 text-[13px] font-medium text-[#292D73] outline-none transition placeholder:text-[#6B7280] focus:border-[#292D73] focus:ring-2 focus:ring-[#292D73]/15"
              />
            ))}
          </div>

          <textarea
            value={formValues.message}
            onChange={(event) => updateField("message", event.target.value)}
            placeholder="Any Message"
            required
            className="mt-6 min-h-[122px] w-full resize-none rounded-[4px] border border-[#9CA3AF] p-3 text-[13px] font-medium text-[#292D73] outline-none transition placeholder:text-[#6B7280] focus:border-[#292D73] focus:ring-2 focus:ring-[#292D73]/15"
          />

          <button
            type="submit"
            disabled={isPending}
            className="mx-auto mt-7 flex h-10 w-full max-w-[220px] items-center justify-center rounded-[5px] bg-[#292D73] text-[12px] font-extrabold text-white transition hover:bg-[#20255F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? "Submitting..." : advertiseContent.submitLabel}
          </button>
        </form>
      </div>
    </section>
  );
};

export default AdvertiseWithUsContainer;
