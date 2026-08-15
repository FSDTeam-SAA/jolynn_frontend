"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Pencil } from "lucide-react";
import { useSession } from "next-auth/react";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

type ContactDetails = {
  businessEmail: string;
  phoneNumber: string;
  businessWebsiteUrl: string;
  serviceArea: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postcode: string;


  
};

type UserProfile = ContactDetails & {
  _id: string;
  email: string;
};

type ProfileResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: UserProfile;
};

const emptyContactDetails: ContactDetails = {
  businessEmail: "",
  phoneNumber: "",
  businessWebsiteUrl: "",
  serviceArea: "",
  address: "",
  city: "",
  state: "",
  country: "",
  postcode: "",
};

const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("The profile API is not configured.");
  return apiUrl.replace(/\/$/, "");
};

async function readProfileResponse(response: Response) {
  const result = (await response.json().catch(() => null)) as ProfileResponse | null;
  if (!response.ok || !result?.success || !result.data) {
    throw new Error(result?.message || "Unable to load contact information.");
  }
  return result;
}

const toContactDetails = (profile: UserProfile): ContactDetails => ({
  businessEmail: profile.businessEmail || "",
  phoneNumber: profile.phoneNumber || "",
  businessWebsiteUrl: profile.businessWebsiteUrl || "",
  serviceArea: profile.serviceArea || "",
  address: profile.address || "",
  city: profile.city || "",
  state: profile.state || "",
  country: profile.country || "",
  postcode: profile.postcode || "",
});

function ContactIfo() {
  const { data: session, status: sessionStatus } = useSession();
  const user = session?.user as { token?: string; accessToken?: string } | undefined;
  const token = user?.accessToken ?? user?.token;
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<ContactDetails>(emptyContactDetails);
  const [isEditing, setIsEditing] = useState(false);

  const profileQuery = useQuery<ProfileResponse>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      if (!token) throw new Error("Please sign in to view contact information.");
      const response = await fetch(`${getApiUrl()}/user/profile`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      return readProfileResponse(response);
    },
    enabled: Boolean(token),
    staleTime: 60 * 1000,
    retry: 1,
  });

  const profile = profileQuery.data?.data;

  useEffect(() => {
    if (profile) setDraft(toContactDetails(profile));
  }, [profile]);

  const updateMutation = useMutation<ProfileResponse, Error>({
    mutationFn: async () => {
      if (!token) throw new Error("Please sign in to update contact information.");
      const formData = new FormData();
      Object.entries(draft).forEach(([key, value]) => formData.append(key, value.trim()));
      const response = await fetch(`${getApiUrl()}/user/profile`, {
        method: "PUT",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        body: formData,
      });
      return readProfileResponse(response);
    },
    onSuccess: async (result) => {
      toast.success(result.message || "Contact information updated successfully.");
      setIsEditing(false);
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const startEditing = () => {
    if (profile) setDraft(toContactDetails(profile));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (profile) setDraft(toContactDetails(profile));
    setIsEditing(false);
  };

  const setField = (field: keyof ContactDetails, value: string) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const saveContactDetails = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (draft.businessEmail && !/^\S+@\S+\.\S+$/.test(draft.businessEmail)) {
      return toast.error("Please enter a valid business email.");
    }
    if (draft.businessWebsiteUrl) {
      try {
        new URL(draft.businessWebsiteUrl);
      } catch {
        return toast.error("Please enter a valid website URL, including https://.");
      }
    }
    updateMutation.mutate();
  };

  const isLoading = sessionStatus === "loading" || (Boolean(token) && profileQuery.isPending);
  const disabled = !isEditing || updateMutation.isPending;
  const fieldClassName = `h-[38px] w-full rounded-[2px] border border-[#C9CDD2] bg-white px-3 text-[13px] text-[#5F6368] outline-none transition-shadow placeholder:text-[#858A91] ${isEditing ? "focus:border-[#30347F] focus:ring-2 focus:ring-[#30347F]/10" : "cursor-default bg-[#FAFAFA]"}`;

  if (isLoading) {
    return <section className="rounded-[9px] bg-white p-5"><Skeleton className="mb-5 h-6 w-32" /><div className="grid gap-4 lg:grid-cols-3">{Array.from({ length: 9 }).map((_, index) => <div key={index} className="space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-[38px] w-full" /></div>)}</div></section>;
  }

  if (!token || profileQuery.isError || !profile) {
    return <section className="flex min-h-[280px] flex-col items-center justify-center rounded-[9px] bg-white px-6 text-center"><AlertCircle className="h-9 w-9 text-red-500" /><h2 className="mt-3 font-semibold text-[#202124]">Unable to load contact information</h2><p className="mt-1 text-sm text-[#667085]">{profileQuery.error instanceof Error ? profileQuery.error.message : "Please sign in and try again."}</p>{token && <button type="button" onClick={() => profileQuery.refetch()} className="mt-4 rounded-md bg-[#30347F] px-5 py-2 text-xs font-medium text-white">Try again</button>}</section>;
  }

  return (
    <section className="rounded-[9px] bg-white px-4 pb-4 pt-3.5 sm:px-5 sm:pb-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div><h1 className="text-[18px] font-medium text-[#202124]">Contact Information</h1><p className="mt-0.5 text-[11px] text-[#667085]">This information is shown to customers on your business profile.</p></div>
        {!isEditing && <button type="button" aria-label="Edit contact information" onClick={startEditing} className="flex h-8 w-8 items-center justify-center rounded-full text-[#172B4D] transition-colors hover:bg-[#F3F4FA] hover:text-[#30347F]"><Pencil className="h-[18px] w-[18px]" /></button>}
      </div>

      <form onSubmit={saveContactDetails}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Field label="Account Email" hint="Login email cannot be changed here"><input type="email" value={profile.email || ""} disabled className={`${fieldClassName} cursor-not-allowed bg-[#F2F4F7]`} /></Field>
          <Field label="Business Email"><input type="email" readOnly={disabled} value={draft.businessEmail} onChange={(event) => setField("businessEmail", event.target.value)} placeholder="contact@business.com" className={fieldClassName} /></Field>
          <Field label="Phone Number"><input type="tel" readOnly={disabled} value={draft.phoneNumber} onChange={(event) => setField("phoneNumber", event.target.value)} placeholder="Enter phone number" className={fieldClassName} /></Field>
          <Field label="Website"><input type="url" readOnly={disabled} value={draft.businessWebsiteUrl} onChange={(event) => setField("businessWebsiteUrl", event.target.value)} placeholder="https://example.com" className={fieldClassName} /></Field>
          <Field label="Service Area"><input readOnly={disabled} value={draft.serviceArea} onChange={(event) => setField("serviceArea", event.target.value)} placeholder="e.g. 15 miles around New York" className={fieldClassName} /></Field>
          <Field label="Postcode"><input readOnly={disabled} value={draft.postcode} onChange={(event) => setField("postcode", event.target.value)} placeholder="Enter postcode" className={fieldClassName} /></Field>
          <Field label="City"><input readOnly={disabled} value={draft.city} onChange={(event) => setField("city", event.target.value)} placeholder="Enter city" className={fieldClassName} /></Field>
          <Field label="State"><input readOnly={disabled} value={draft.state} onChange={(event) => setField("state", event.target.value)} placeholder="Enter state" className={fieldClassName} /></Field>
          <Field label="Country"><input readOnly={disabled} value={draft.country} onChange={(event) => setField("country", event.target.value)} placeholder="Enter country" className={fieldClassName} /></Field>
          <div className="lg:col-span-3"><Field label="Street Address"><textarea readOnly={disabled} rows={3} value={draft.address} onChange={(event) => setField("address", event.target.value)} placeholder="Enter your business address" className={`min-h-[72px] w-full resize-none rounded-[2px] border border-[#C9CDD2] px-3 py-3 text-[13px] text-[#5F6368] outline-none ${isEditing ? "focus:border-[#30347F] focus:ring-2 focus:ring-[#30347F]/10" : "cursor-default bg-[#FAFAFA]"}`} /></Field></div>
        </div>

        {isEditing && <div className="mt-4 flex justify-end gap-3"><button type="button" disabled={updateMutation.isPending} onClick={cancelEditing} className="h-9 rounded-[6px] border border-[#30347F] px-5 text-xs font-medium text-[#30347F] hover:bg-[#F3F4FA] disabled:opacity-50">Cancel</button><button type="submit" disabled={updateMutation.isPending} className="h-9 rounded-[6px] bg-[#30347F] px-5 text-xs font-medium text-white hover:bg-[#252966] disabled:cursor-not-allowed disabled:opacity-60">{updateMutation.isPending ? "Saving..." : "Save Changes"}</button></div>}
      </form>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="block space-y-2 text-xs font-medium text-[#3F444A]"><span>{label}</span>{children}{hint && <span className="block text-[9px] font-normal text-[#98A2B3]">{hint}</span>}</label>;
}

export default ContactIfo;
