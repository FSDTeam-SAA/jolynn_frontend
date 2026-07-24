"use client";

import { useProfileQuery } from "@/hooks/APicalling";
import { useServices } from "@/hooks/use-services";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
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
  const { data: session, status: sessionStatus } = useSession();
  const [values, setValues] = useState(initialValues);
  const [formMessage, setFormMessage] = useState("");
  const prefilledProfileId = useRef<string | null>(null);
  const sessionUser = session?.user as
    | { token?: string; accessToken?: string }
    | undefined;
  const token = sessionUser?.accessToken ?? sessionUser?.token;
  const profileQuery = useProfileQuery(token);
  const profile = profileQuery.data?.data;
  const servicesQuery = useServices();
  const services = servicesQuery.data?.data ?? [];

  useEffect(() => {
    if (!profile || prefilledProfileId.current === profile._id) return;

    const profileName = profile.username || "";

    setValues((current) => ({
      ...current,
      name: current.name || profileName,
      email: current.email || profile.email || "",
      zipCode: current.zipCode || profile.postcode || "",
      phone: current.phone || profile.phoneNumber || "",
    }));
    prefilledProfileId.current = profile._id;
  }, [profile]);

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
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

        {profile && (
          <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-[#CFE5E2] bg-[#F0F8F7] px-4 py-3 text-xs leading-5 text-[#426078] sm:text-sm">
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0 text-[#16857A]"
              aria-hidden="true"
            />
            <p>
              Your saved profile details have been added. You can edit them for
              this job post if needed.
            </p>
          </div>
        )}

        {token && profileQuery.isError && (
          <div
            role="alert"
            className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 sm:text-sm"
          >
            <span>We couldn&apos;t load your saved profile details.</span>
            <button
              type="button"
              onClick={() => profileQuery.refetch()}
              className="font-bold text-[#292D73] underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}

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
              <span className="relative mt-2 block">
                <select
                required
                value={values.category}
                onChange={(event) =>
                  updateValue("category", event.target.value)
                }
                  disabled={servicesQuery.isPending || servicesQuery.isError}
                  className="h-11 w-full appearance-none rounded-[4px] border border-[#C7CBD1] bg-white px-3 pr-10 text-[16px] text-[#292D73] outline-none transition focus:border-[#292D73] focus:ring-2 focus:ring-[#292D73]/15 disabled:cursor-not-allowed disabled:bg-[#F5F7FA] disabled:text-[#98A2B3]"
                >
                  <option value="" disabled>
                    {servicesQuery.isPending
                      ? "Loading categories..."
                      : servicesQuery.isError
                        ? "Categories unavailable"
                        : services.length === 0
                          ? "No categories available"
                          : "Select a category"}
                  </option>
                  {services.map((service) => (
                    <option key={service._id} value={service.title}>
                      {service.title}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]"
                  aria-hidden="true"
                />
              </span>
              {servicesQuery.isError && (
                <button
                  type="button"
                  onClick={() => servicesQuery.refetch()}
                  className="mt-1.5 text-xs font-semibold text-[#292D73] underline underline-offset-2"
                >
                  Retry categories
                </button>
              )}
            </label>
          </div>

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
            disabled={
              isPending ||
              sessionStatus === "loading" ||
              servicesQuery.isPending ||
              servicesQuery.isError ||
              services.length === 0
            }
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
