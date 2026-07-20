"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { toast } from "sonner";

type VisibilityState = {
  current: boolean;
  next: boolean;
  confirm: boolean;
};

type ChangePasswordResponse = {
  success?: boolean;
  status?: boolean;
  message?: string;
};

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!baseUrl) throw new Error("Backend API URL is not configured.");
  return baseUrl.replace(/\/$/, "");
}

function SecurityPage() {
  const { data: session } = useSession();
  const accessToken = (session?.user as { accessToken?: string } | undefined)
    ?.accessToken;
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visible, setVisible] = useState<VisibilityState>({
    current: false,
    next: false,
    confirm: false,
  });

  const requirements = useMemo(
    () => [
      {
        text: "Minimum 8–12 characters (recommend 12+ for stronger security).",
        valid: newPassword.length >= 8,
      },
      {
        text: "At least one uppercase letter must.",
        valid: /[A-Z]/.test(newPassword),
      },
      {
        text: "At least one lowercase letter must.",
        valid: /[a-z]/.test(newPassword),
      },
      {
        text: "At least one number must (0–9).",
        valid: /\d/.test(newPassword),
      },
      {
        text: "At least special character (! @ # $ % ^ & * etc.).",
        valid: /[^A-Za-z0-9\s]/.test(newPassword),
      },
      {
        text: "No spaces allowed.",
        valid: newPassword.length > 0 && !/\s/.test(newPassword),
      },
    ],
    [newPassword],
  );

  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;
  const isFormValid =
    currentPassword.length > 0 &&
    requirements.every((requirement) => requirement.valid) &&
    passwordsMatch;

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setVisible({ current: false, next: false, confirm: false });
  };

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error("You are not authorized.");

      const response = await fetch(`${getApiBaseUrl()}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          oldPassword: currentPassword,
          newPassword,
        }),
      });

      const data = (await response
        .json()
        .catch(() => null)) as ChangePasswordResponse | null;

      if (!response.ok || data?.success === false || data?.status === false) {
        throw new Error(data?.message || "Unable to change password.");
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Password changed successfully.");
      resetForm();
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to change password.",
      );
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid || changePasswordMutation.isPending) return;
    changePasswordMutation.mutate();
  };

  return (
    <section className="rounded-[9px] bg-white px-4 py-4 sm:px-5">
      <h1 className="text-[18px] font-medium text-[#171717]">
        Changes Password
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex min-h-[335px] flex-col"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PasswordField
            label="Current Password"
            value={currentPassword}
            visible={visible.current}
            disabled={changePasswordMutation.isPending}
            onChange={setCurrentPassword}
            onToggle={() =>
              setVisible((current) => ({
                ...current,
                current: !current.current,
              }))
            }
          />
          <PasswordField
            label="New Password"
            value={newPassword}
            visible={visible.next}
            disabled={changePasswordMutation.isPending}
            onChange={setNewPassword}
            onToggle={() =>
              setVisible((current) => ({ ...current, next: !current.next }))
            }
          />
          <div className="lg:col-span-2">
            <PasswordField
              label="Confirm New Password"
              value={confirmPassword}
              visible={visible.confirm}
              disabled={changePasswordMutation.isPending}
              hasError={
                confirmPassword.length > 0 && newPassword !== confirmPassword
              }
              onChange={setConfirmPassword}
              onToggle={() =>
                setVisible((current) => ({
                  ...current,
                  confirm: !current.confirm,
                }))
              }
            />
          </div>
        </div>

        <ul className="mt-4 space-y-2 text-[11px]">
          {requirements.map((requirement) => {
            const showValid = requirement.valid;
            return (
              <li
                key={requirement.text}
                className={`flex items-center gap-2 ${
                  showValid ? "text-[#159447]" : "text-[#FF254B]"
                }`}
              >
                {showValid ? (
                  <Check className="h-4 w-4 shrink-0" strokeWidth={1.7} />
                ) : (
                  <X className="h-4 w-4 shrink-0" strokeWidth={1.7} />
                )}
                <span>{requirement.text}</span>
              </li>
            );
          })}
          {confirmPassword && !passwordsMatch && (
            <li className="flex items-center gap-2 text-[#FF254B]">
              <X className="h-4 w-4 shrink-0" strokeWidth={1.7} />
              <span>New password and confirm password must match.</span>
            </li>
          )}
        </ul>

        <div className="mt-auto flex flex-col justify-end gap-2 pt-5 sm:flex-row">
          <button
            type="button"
            onClick={resetForm}
            disabled={changePasswordMutation.isPending}
            className="h-[35px] min-w-[108px] cursor-pointer rounded-[6px] border border-[#30347F] px-5 text-[11px] font-medium text-[#30347F] transition-colors hover:bg-[#F3F4FA] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isFormValid || changePasswordMutation.isPending}
            className="h-[35px] min-w-[108px] cursor-pointer rounded-[6px] bg-[#30347F] px-5 text-[11px] font-medium text-white transition-colors hover:bg-[#252966] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {changePasswordMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
}

function PasswordField({
  label,
  value,
  visible,
  disabled,
  hasError = false,
  onChange,
  onToggle,
}: {
  label: string;
  value: string;
  visible: boolean;
  disabled: boolean;
  hasError?: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <label className="block space-y-2 text-[12px] font-medium text-[#3F444A]">
      <span>{label}</span>
      <span className="relative block">
        <input
          type={visible ? "text" : "password"}
          required
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={`h-[40px] w-full rounded-[3px] border bg-white px-3 pr-11 text-sm text-[#344054] outline-none transition-shadow disabled:cursor-not-allowed disabled:opacity-60 ${
            hasError
              ? "border-[#FF254B] focus:ring-2 focus:ring-[#FF254B]/10"
              : "border-[#C9CDD2] focus:border-[#30347F] focus:ring-2 focus:ring-[#30347F]/10"
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#687078] transition-colors hover:text-[#30347F] disabled:cursor-not-allowed"
        >
          {visible ? (
            <EyeOff className="h-[18px] w-[18px]" />
          ) : (
            <Eye className="h-[18px] w-[18px]" />
          )}
        </button>
      </span>
    </label>
  );
}

export default SecurityPage;
