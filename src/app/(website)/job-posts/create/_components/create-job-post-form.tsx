"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

type FormValues = {
  name: string;
  email: string;
  zipCode: string;
  category: string;
  phone: string;
  message: string;
};

type HelpWantedPayload = {
  username: string;
  email: string;
  zipcode: string;
  category: string;
  phone: string;
  message: string;
};

type HelpWantedResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: HelpWantedPayload & {
    _id: string;
    createdAt: string;
    updatedAt: string;
  };
};

const initialValues: FormValues = {
  name: "",
  email: "",
  zipCode: "",
  category: "",
  phone: "",
  message: "",
};

const inputClassName =
  "mt-2 h-11 w-full rounded-[4px] border border-[#C7CBD1] bg-white px-3 text-[16px] text-[#292D73] outline-none transition placeholder:text-[#98A2B3] focus:border-[#292D73] focus:ring-2 focus:ring-[#292D73]/15";

const CreateJobPostForm = () => {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [formMessage, setFormMessage] = useState("");

  const { mutate, isPending } = useMutation<
    HelpWantedResponse,
    Error,
    HelpWantedPayload
  >({
    mutationKey: ["create-help-wanted"],
    mutationFn: async (payload) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error("The help wanted service is not configured.");

      const response = await fetch(`${apiUrl}/help-wanted`, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as HelpWantedResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to submit your request.");
      }

      return result;
    },
    onSuccess: (result) => {
      setValues(initialValues);
      setFormMessage(result.message);
      toast.success(result.message);
      router.push("/job-posts");
    },
    onError: (error) => {
      setFormMessage(error.message);
      toast.error(error.message);
    },
  });

  const updateValue = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (formMessage) setFormMessage("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormMessage("");
    mutate({
      username: values.name.trim(),
      email: values.email.trim(),
      zipcode: values.zipCode.trim(),
      category: values.category.trim(),
      phone: values.phone.trim(),
      message: values.message.trim(),
    });
  };

  return (
    <section className="min-h-[620px] bg-white px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <div className="mx-auto w-full max-w-[680px]">
        <h1 className="text-center text-[30px] font-extrabold text-[#111827] md:text-[34px]">
          Post About Your Necessary Service
        </h1>

        <form onSubmit={handleSubmit} className="mt-10">
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <label className="text-[16px] font-semibold text-[#111827]">
              User Name
              <input
                required
                value={values.name}
                onChange={(event) => updateValue("name", event.target.value)}
                placeholder="Name Here"
                className={inputClassName}
              />
            </label>
            <label className="text-[16px] font-semibold text-[#111827]">
              Email Address
              <input
                required
                type="email"
                value={values.email}
                onChange={(event) => updateValue("email", event.target.value)}
                placeholder="hello@example.com"
                className={inputClassName}
              />
            </label>
            <label className="text-[16px] font-semibold text-[#111827]">
              Zip code
              <input
                required
                value={values.zipCode}
                onChange={(event) =>
                  updateValue("zipCode", event.target.value)
                }
                placeholder="123456"
                className={inputClassName}
              />
            </label>
            <label className="text-[16px] font-semibold text-[#111827]">
              Category
              <input
                required
                value={values.category}
                onChange={(event) =>
                  updateValue("category", event.target.value)
                }
                placeholder="Plumbing"
                className={inputClassName}
              />
            </label>
          </div>

          <label className="mt-4 block text-[16px] font-semibold text-[#111827]">
            Phone Number
            <input
              required
              type="tel"
              value={values.phone}
              onChange={(event) => updateValue("phone", event.target.value)}
              placeholder="+1234567890"
              className={inputClassName}
            />
          </label>

          <label className="mt-4 block text-[16px] font-semibold text-[#111827]">
            Service wanted Message
            <textarea
              required
              value={values.message}
              onChange={(event) => updateValue("message", event.target.value)}
              placeholder="Describe the service you need, your preferred timeline, and any important details."
              className="mt-2 min-h-[150px] w-full resize-y rounded-[4px] border border-[#C7CBD1] px-3 py-3 text-[16px] text-[#292D73] outline-none placeholder:text-[#98A2B3] focus:border-[#292D73] focus:ring-2 focus:ring-[#292D73]/15"
            />
          </label>

          {formMessage && (
            <p role="status" className="mt-3 text-center text-[15px] text-[#292E78]">
              {formMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mx-auto mt-8 flex h-11 w-full max-w-[280px] items-center justify-center rounded-[5px] bg-[#292E78] text-[16px] font-extrabold text-white transition hover:bg-[#20255F] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Posting..." : "Post"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default CreateJobPostForm;
