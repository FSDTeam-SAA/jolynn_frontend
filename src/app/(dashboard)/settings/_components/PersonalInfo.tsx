"use client";

import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { LogOut, Pencil, UserRound } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import ProfileSummaryCard from "./ProfileSummaryCard";
import LogoutModal from "@/components/modals/LogoutModal";

export interface SettingsProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage: string;
  createdAt?: string;
  address?: {
    country?: string;
    cityState?: string;
    roadArea?: string;
    postalCode?: string;
  };
}

interface ProfileResponse {
  status?: boolean;
  success?: boolean;
  message?: string;
  data: SettingsProfile;
}

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!baseUrl) throw new Error("Backend API URL is not configured.");
  return baseUrl.replace(/\/$/, "");
}

export default function PersonalInfo() {
  const { data: session } = useSession();
  const accessToken = (session?.user as { accessToken?: string } | undefined)
    ?.accessToken;
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [country, setCountry] = useState("");
  const [nationality, setNationality] = useState("");
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File>();
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["user-profile"],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const response = await fetch(`${getApiBaseUrl()}/user/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = (await response
        .json()
        .catch(() => null)) as ProfileResponse | null;
      if (
        !response.ok ||
        data?.success === false ||
        data?.status === false ||
        !data?.data
      )
        throw new Error(data?.message || "Unable to load profile.");
      return data.data;
    },
  });

  const populateForm = (user: SettingsProfile) => {
    const [first = "", ...rest] = (user.name || "").trim().split(/\s+/);
    setFirstName(first);
    setLastName(rest.join(" "));
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setLocation(user.address?.cityState || user.address?.country || "");
    setCountry(user.address?.country || "");
    setPostalCode(user.address?.postalCode || "");
    setProfileImagePreview(user.profileImage || "");
  };

  useEffect(() => {
    if (profileQuery.data) {
      populateForm(profileQuery.data);
      setProfileImageFile(undefined);
    }
  }, [profileQuery.data]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${getApiBaseUrl()}/user/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          phone: phone.trim(),
          address: {
            cityState: location.trim(),
            country: country.trim(),
            postalCode: postalCode.trim(),
          },
        }),
      });
      const profileData = (await response
        .json()
        .catch(() => null)) as ProfileResponse | null;
      if (
        !response.ok ||
        profileData?.success === false ||
        profileData?.status === false
      )
        throw new Error(profileData?.message || "Unable to update profile.");
      if (!profileImageFile) return profileData;
      const formData = new FormData();
      formData.append("profileImage", profileImageFile, profileImageFile.name);
      const avatarResponse = await fetch(
        `${getApiBaseUrl()}/user/upload-avatar`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        },
      );
      const avatarData = (await avatarResponse
        .json()
        .catch(() => null)) as ProfileResponse | null;
      if (
        !avatarResponse.ok ||
        avatarData?.success === false ||
        avatarData?.status === false
      )
        throw new Error(
          avatarData?.message || "Unable to update profile image.",
        );
      return avatarData || profileData;
    },
    onSuccess: async (data) => {
      toast.success(data?.message || "Profile updated successfully.");
      setProfileImageFile(undefined);
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error: unknown) =>
      toast.error(
        error instanceof Error ? error.message : "Unable to update profile.",
      ),
  });

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProfileImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setProfileImagePreview(String(reader.result));
    reader.readAsDataURL(file);
  };
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!firstName.trim()) return toast.error("First name is required.");
    if (!accessToken) return toast.error("You are not authorized.");
    updateProfileMutation.mutate();
  };
  const user = profileQuery.data;
  const fullName = `${firstName} ${lastName}`.trim() || user?.name || "User";
  const disabled = profileQuery.isLoading || updateProfileMutation.isPending;
  const inputClass = "h-10 w-full rounded-lg border border-[#E1CFA9]/70 bg-[#48321E] px-3.5 text-xs font-medium text-[#FFF2D2] outline-none transition placeholder:text-[#A98D68] focus:border-[#E0B85C] focus:ring-2 focus:ring-[#E0B85C]/15 disabled:cursor-not-allowed disabled:bg-[#442F1C] disabled:opacity-75";

  return (
    <div className="space-y-4">
      <ProfileSummaryCard
        name={fullName}
        email={email || user?.email}
        phone={phone}
        location={location}
        since={user?.createdAt}
        image={profileImagePreview}
        disabled={disabled}
        onImageChange={handleImage}
      />
      <form onSubmit={handleSubmit} className="space-y-5">
      <section className="overflow-hidden rounded-xl border border-[#765B38] bg-[linear-gradient(145deg,#563D22_0%,#49321D_100%)] shadow-[0_12px_30px_rgba(41,28,15,0.18)]">
        <div className="flex items-center justify-between border-b border-[#755A37]/80 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E0B85C]/15 text-[#F2D78F]"><UserRound className="h-4 w-4" /></span>
            <div><h2 className="text-sm font-bold text-[#FFF0C9]">Personal Information</h2><p className="mt-0.5 text-[11px] text-[#BFA98A]">Manage your basic profile details.</p></div>
          </div>
          <button type="button" onClick={() => setEditingPersonal((value) => !value)} aria-label="Edit personal information" className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#8A6A41] text-[#F2D78F] transition hover:border-[#D6AA50] hover:bg-[#D6AA50]/10 hover:text-[#FFE7A8]"><Pencil className="h-4 w-4" /></button>
        </div>
        {profileQuery.error && (
          <p className="mx-4 mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 sm:mx-5">
            {profileQuery.error instanceof Error
              ? profileQuery.error.message
              : "Unable to load profile."}
          </p>
        )}
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
            <Field label="First Name">
              <input
                required
                value={firstName}
                disabled={disabled || !editingPersonal}
                onChange={(event) => setFirstName(event.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Last Name">
              <input
                value={lastName}
                disabled={disabled || !editingPersonal}
                onChange={(event) => setLastName(event.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Date of Birth"><input type="date" value={dateOfBirth} disabled={disabled || !editingPersonal} onChange={(event) => setDateOfBirth(event.target.value)} className={inputClass} /></Field>
          </div>
      </section>

      <section className="rounded-xl border border-[#765B38] bg-[linear-gradient(145deg,#563D22_0%,#49321D_100%)] p-4 shadow-[0_12px_30px_rgba(41,28,15,0.18)] sm:p-5">
        <div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-bold text-[#FFF0C9]">Contact Information</h2><p className="mt-0.5 text-[11px] text-[#BFA98A]">Keep your contact and location details current.</p></div><button type="button" onClick={() => setEditingContact((value) => !value)} aria-label="Edit contact information" className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#8A6A41] text-[#F2D78F] transition hover:border-[#D6AA50] hover:bg-[#D6AA50]/10"><Pencil className="h-4 w-4" /></button></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email"><input type="email" value={email} disabled className={inputClass} /></Field>
          <Field label="Phone Number"><input type="tel" value={phone} disabled={disabled || !editingContact} onChange={(event) => setPhone(event.target.value)} placeholder="Enter your phone number" className={inputClass} /></Field>
          <Field label="Country"><select value={country} disabled={disabled || !editingContact} onChange={(event) => setCountry(event.target.value)} className={inputClass}><option value="">Choose any one</option><option>United States</option><option>Cuba</option><option>Bangladesh</option></select></Field>
          <Field label="State/Region"><input value={location} disabled={disabled || !editingContact} onChange={(event) => setLocation(event.target.value)} placeholder="Enter state or region" className={inputClass} /></Field>
          <Field label="Nationality"><select value={nationality} disabled={disabled || !editingContact} onChange={(event) => setNationality(event.target.value)} className={inputClass}><option value="">Choose any one</option><option>American</option><option>Cuban</option><option>Bangladeshi</option></select></Field>
          <Field label="Postcode"><input value={postalCode} disabled={disabled || !editingContact} onChange={(event) => setPostalCode(event.target.value)} placeholder="e.g. 5585" className={inputClass} /></Field>
        </div>
        {(editingPersonal || editingContact) ? <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => user && populateForm(user)}
              disabled={disabled}
              className="h-9 cursor-pointer rounded-md border border-[#D6AA50] px-4 text-xs text-[#F7E4B3] hover:bg-[#D6AA50]/10"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={disabled}
              className="h-9 cursor-pointer rounded-md bg-[#D6AA50] px-5 text-xs font-semibold text-[#3A2818] hover:bg-[#E7BF69] disabled:opacity-50"
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div> : null}
      </section>
      </form>

      <section className="flex flex-col gap-4 rounded-xl border border-red-300/30 bg-[#4A2E20] p-4 shadow-[0_10px_24px_rgba(41,28,15,0.14)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h2 className="text-sm font-bold text-[#FFE8DE]">Sign out of your account</h2>
          <p className="mt-1 text-[11px] leading-5 text-[#C9AA9A]">End your current session securely on this device.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsLogoutOpen(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-xs font-bold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#4A2E20]"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </section>

      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={() => {
          setIsLogoutOpen(false);
          void signOut({ callbackUrl: "/" });
        }}
      />
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-[11px] font-medium text-[#F7E4B3]">
      <span>{label}</span>
      {children}
    </label>
  );
}
