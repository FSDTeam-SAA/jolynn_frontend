"use client";

import { useChangePassword } from "@/hooks/APicalling";
import { Eye, EyeOff } from "lucide-react";
import { useSession } from "next-auth/react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { AccountPageShell, AccountPanel } from "../../_components/account-ui";

type PasswordField = "oldPassword" | "newPassword" | "confirmPassword";

const initialValues: Record<PasswordField, string> = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const passwordFields: { id: PasswordField; label: string; wide?: boolean }[] = [
  { id: "oldPassword", label: "Current Password" },
  { id: "newPassword", label: "New Password" },
  { id: "confirmPassword", label: "Confirm New Password", wide: true },
];

const ChangePasswordContainer = () => {
  const { data: session } = useSession();
  const user = session?.user as
    | { token?: string; accessToken?: string }
    | undefined;
  const [values, setValues] = useState(initialValues);
  const [visibleFields, setVisibleFields] = useState<Set<PasswordField>>(
    new Set(),
  );

  const rules = [
    { text: "At least 8 characters (required)", valid: values.newPassword.length >= 8 },
    { text: "Contains an uppercase letter (recommended)", valid: /[A-Z]/.test(values.newPassword) },
    { text: "Contains a lowercase letter (recommended)", valid: /[a-z]/.test(values.newPassword) },
    { text: "Contains a number (recommended)", valid: /\d/.test(values.newPassword) },
    { text: "Contains a special character (recommended)", valid: /[^A-Za-z0-9]/.test(values.newPassword) },
    { text: "Contains no spaces (recommended)", valid: values.newPassword.length > 0 && !/\s/.test(values.newPassword) },
  ];

  const resetForm = () => {
    setValues(initialValues);
    setVisibleFields(new Set());
  };

  const { mutate, isPending } = useChangePassword(
    user?.accessToken ?? user?.token,
    resetForm,
  );

  const toggleVisibility = (field: PasswordField) => {
    setVisibleFields((current) => {
      const next = new Set(current);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!values.oldPassword || !values.newPassword || !values.confirmPassword) {
      toast.error("Please complete all password fields.");
      return;
    }
    if (values.newPassword.length < 8) {
      toast.error("Your new password must be at least 8 characters.");
      return;
    }
    if (values.newPassword !== values.confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    if (values.oldPassword === values.newPassword) {
      toast.error("Your new password must be different from your current password.");
      return;
    }

    mutate({
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
    });
  };

  const confirmationInvalid =
    values.confirmPassword.length > 0 &&
    values.newPassword !== values.confirmPassword;

  return (
    <AccountPageShell active="change-password">
      <AccountPanel
        title="Change Password"
        description="Choose a strong, unique password to keep your account secure."
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
            {passwordFields.map((field) => {
              const visible = visibleFields.has(field.id);
              const invalid = field.id === "confirmPassword" && confirmationInvalid;

              return (
                <label key={field.id} className={field.wide ? "md:col-span-2" : undefined}>
                  <span className="text-[12px] font-semibold text-[#111827]">{field.label}</span>
                  <span className="relative mt-2 block">
                    <input
                      type={visible ? "text" : "password"}
                      value={values[field.id]}
                      onChange={(event) => setValues((current) => ({ ...current, [field.id]: event.target.value }))}
                      autoComplete={field.id === "oldPassword" ? "current-password" : "new-password"}
                      aria-invalid={invalid}
                      className={`h-10 w-full rounded-[2px] border bg-white px-4 pr-10 text-[12px] font-medium text-[#667085] outline-none focus:ring-2 ${invalid ? "border-[#FF4D5E] focus:border-[#FF4D5E] focus:ring-[#FF4D5E]/15" : "border-[#B8C0CC] focus:border-[#292D73] focus:ring-[#292D73]/15"}`}
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility(field.id)}
                      aria-label={`${visible ? "Hide" : "Show"} ${field.label.toLowerCase()}`}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#292D73]"
                    >
                      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </span>
                  {invalid && <span className="mt-1 block text-[11px] font-medium text-[#E11D48]">Passwords do not match.</span>}
                </label>
              );
            })}
          </div>

          <ul className="space-y-2" aria-label="Password requirements">
            {rules.map((rule) => (
              <li key={rule.text} className={`text-[12px] font-medium ${rule.valid ? "text-[#098A45]" : "text-[#667085]"}`}>
                {rule.valid ? "✓" : "○"} {rule.text}
              </li>
            ))}
          </ul>

          <div className="flex justify-end gap-3 pt-8">
            <button type="button" onClick={resetForm} disabled={isPending} className="h-10 rounded-[4px] border border-[#8A94A6] px-4 text-[12px] font-semibold text-[#475467] transition hover:bg-[#F8FAFC] disabled:opacity-50">
              Discard Changes
            </button>
            <button type="submit" disabled={isPending} className="h-10 rounded-[4px] bg-[#292D73] px-5 text-[12px] font-extrabold text-white transition hover:bg-[#20255F] disabled:cursor-not-allowed disabled:opacity-60">
              {isPending ? "Changing Password..." : "Change Password"}
            </button>
          </div>
        </form>
      </AccountPanel>
    </AccountPageShell>
  );
};

export default ChangePasswordContainer;
