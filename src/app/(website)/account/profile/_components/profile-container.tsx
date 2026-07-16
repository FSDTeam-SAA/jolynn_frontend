"use client";

import { useProfileQuery, useProfileUpdate } from "@/hooks/APicalling";
import { UpdateProfilePayload } from "@/lib/profileInfo";
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
  { id: "address", label: "Street Address", type: "text", wide: true },
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
  const [formValues, setFormValues] = useState<ProfileFormValues>(initialValues);

  useEffect(() => {
    setFormValues(initialValues);
  }, [initialValues]);

  const { mutate, isPending } = useProfileUpdate(
    token,
    (response) => {
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
    },
  );

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
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="flex items-center gap-5 text-[12px] font-medium text-[#111827]">
            {(["male", "female"] as const).map((gender) => (
              <label key={gender} className="flex items-center gap-2 capitalize">
                {gender}
                <input
                  type="radio"
                  name="gender"
                  value={gender}
                  checked={formValues.gender === gender}
                  onChange={updateField}
                  className="h-3.5 w-3.5 accent-[#292D73]"
                />
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
            {profileFields.map((field) => (
              <label key={field.id} className={field.wide ? "md:col-span-2" : undefined}>
                <span className="text-[12px] font-semibold text-[#111827]">{field.label}</span>
                <input
                  name={field.id}
                  type={field.type}
                  value={formValues[field.id]}
                  onChange={updateField}
                  disabled={field.id === "email" || isProfileLoading}
                  title={field.id === "email" ? "Email address cannot be changed here" : undefined}
                  className="mt-2 h-10 w-full rounded-[2px] border border-[#B8C0CC] bg-white px-4 text-[12px] font-medium text-[#667085] outline-none focus:border-[#292D73] focus:ring-2 focus:ring-[#292D73]/15 disabled:cursor-not-allowed disabled:bg-[#F2F4F7] disabled:text-[#98A2B3]"
                />
                {field.id === "email" && (
                  <span className="mt-1 block text-[11px] text-[#667085]">Your account email cannot be changed.</span>
                )}
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={discardChanges} disabled={isPending} className="h-10 rounded-[4px] border border-[#8A94A6] px-4 text-[12px] font-semibold text-[#475467] transition hover:bg-[#F8FAFC] disabled:opacity-50">
              Discard Changes
            </button>
            <button type="submit" disabled={isPending} className="h-10 rounded-[4px] bg-[#292D73] px-5 text-[12px] font-extrabold text-white transition hover:bg-[#20255F] disabled:cursor-not-allowed disabled:opacity-60">
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </AccountPanel>
    </AccountPageShell>
  );
};

export default ProfileContainer;
