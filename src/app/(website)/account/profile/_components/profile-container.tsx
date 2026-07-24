"use client";

import { useProfileQuery, useProfileUpdate } from "@/hooks/APicalling";
import { UpdateProfilePayload } from "@/lib/profileInfo";
import { UserRound } from "lucide-react";
import { useSession } from "next-auth/react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { AccountPageShell, AccountPanel } from "../../_components/account-ui";

type ProfileFormValues = Omit<UpdateProfilePayload, "profilePicture">;
type SessionProfile = {
  token?: string;
  accessToken?: string;
};

const emptyProfile: ProfileFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  address: "",
  state: "",
  country: "",
  postcode: "",
  gender: "male",
};

const profileFields = [
  { id: "firstName", label: "First Name", type: "text", wide: false },
  { id: "lastName", label: "Last Name", type: "text", wide: false },
  { id: "email", label: "Email Address", type: "email", wide: false },
  { id: "phoneNumber", label: "Phone Number", type: "tel", wide: false },
  { id: "country", label: "Location", type: "text", wide: false },
  { id: "postcode", label: "Postal Code", type: "text", wide: false },
] as const;

const ProfileContainer = () => {
  const { data: session } = useSession();
  const user = session?.user as SessionProfile | undefined;
  const token = user?.accessToken ?? user?.token;
  const { data: profileResponse, isLoading: isProfileLoading } =
    useProfileQuery(token);
  const profile = profileResponse?.data;

  const initialValues = useMemo<ProfileFormValues>(
    () => ({
      ...emptyProfile,
      firstName: profile?.firstName ?? "",
      lastName: profile?.lastName ?? "",
      email: profile?.email ?? "",
      phoneNumber: profile?.phoneNumber ?? "",
      address: profile?.address ?? "",
      state: profile?.state ?? "",
      country: [profile?.city, profile?.state, profile?.country]
        .filter(Boolean)
        .join(", "),
      postcode: profile?.postcode ?? "",
      gender: profile?.gender ?? "male",
    }),
    [
      profile?.address,
      profile?.city,
      profile?.country,
      profile?.email,
      profile?.firstName,
      profile?.gender,
      profile?.lastName,
      profile?.phoneNumber,
      profile?.postcode,
      profile?.state,
    ],
  );
  const [formValues, setFormValues] =
    useState<ProfileFormValues>(initialValues);

  useEffect(() => {
    setFormValues(initialValues);
  }, [initialValues]);

  const { mutate, isPending } = useProfileUpdate(token, (response) => {
    const updated = response?.data;
    if (!updated) return;
    setFormValues((current) => ({
      ...current,
      firstName: updated.firstName ?? current.firstName,
      lastName: updated.lastName ?? current.lastName,
      email: updated.email ?? current.email,
      phoneNumber: updated.phoneNumber ?? current.phoneNumber,
      address: updated.address ?? current.address,
      state: updated.state ?? current.state,
      country: updated.country ?? current.country,
      postcode: updated.postcode ?? current.postcode,
      gender: updated.gender ?? current.gender,
    }));
  });

  const updateField = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const discardChanges = () => {
    setFormValues(initialValues);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutate(formValues);
  };

  return (
    <AccountPageShell active="profile">
      <AccountPanel
        title="Personal Information"
        description="Manage your personal information and profile details."
      >
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#E3E8F2] bg-gradient-to-br from-[#F7F9FF] to-[#F4FBFB] p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#292D73] text-white shadow-sm">
            <UserRound className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-[#292D73]">
              Your profile details
            </h3>
            <p className="mt-1 text-xs leading-5 text-[#667085]">
              Keep your basic information accurate and up to date.
            </p>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
            {profileFields.map((field) => (
              <label
                key={field.id}
                className={field.wide ? "md:col-span-2" : undefined}
              >
                <span className="text-[12px] font-semibold text-[#111827]">
                  {field.label}
                </span>
                <input
                  name={field.id}
                  type={field.type}
                  value={formValues[field.id]}
                  onChange={updateField}
                  disabled={field.id === "email" || isProfileLoading}
                  title={
                    field.id === "email"
                      ? "Email address cannot be changed here"
                      : undefined
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-[#D0D5DD] bg-white px-4 text-[12px] font-medium text-[#344054] outline-none transition hover:border-[#98A2B3] focus:border-[#292D73] focus:ring-2 focus:ring-[#292D73]/15 disabled:cursor-not-allowed disabled:bg-[#F2F4F7] disabled:text-[#98A2B3]"
                />
                {field.id === "email" && (
                  <span className="mt-1 block text-[11px] text-[#667085]">
                    Your account email cannot be changed.
                  </span>
                )}
              </label>
            ))}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#EAECF0] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={discardChanges}
              disabled={isPending}
              className="h-10 rounded-lg border border-[#D0D5DD] px-5 text-[12px] font-semibold text-[#475467] transition hover:bg-[#F8FAFC] disabled:opacity-50"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="h-10 rounded-lg bg-[#292D73] px-6 text-[12px] font-extrabold text-white shadow-[0_6px_14px_rgba(41,45,115,0.18)] transition hover:-translate-y-0.5 hover:bg-[#20255F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

      </AccountPanel>
    </AccountPageShell>
  );
};

export default ProfileContainer;
