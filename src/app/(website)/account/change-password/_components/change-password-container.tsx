"use client";

import { Eye } from "lucide-react";
import { AccountPageShell, AccountPanel } from "../../_components/account-ui";

const passwordRules = [
  {
    text: "Minimum 8-12 characters (recommend 12+ for stronger security).",
    valid: true,
  },
  {
    text: "At least one uppercase letter must.",
    valid: true,
  },
  {
    text: "At least one lowercase letter must.",
    valid: true,
  },
  {
    text: "At least one number must (0-9).",
    valid: true,
  },
  {
    text: "At least special character (! @ # $ % ^ & * etc.).",
    valid: false,
  },
  {
    text: "No spaces allowed.",
    valid: false,
  },
];

const passwordFields = [
  {
    id: "currentPassword",
    label: "Current Password",
  },
  {
    id: "newPassword",
    label: "New Password",
  },
  {
    id: "confirmPassword",
    label: "Confirm New Password",
    wide: true,
    invalid: true,
  },
];

const ChangePasswordContainer = () => {
  return (
    <AccountPageShell active="change-password">
      <AccountPanel
        title="Changes Password"
        description="Manage your account preferences, security settings, and privacy options."
      >
        <form className="space-y-5">
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
            {passwordFields.map((field) => (
              <label
                key={field.id}
                className={field.wide ? "md:col-span-2" : undefined}
              >
                <span className="text-[12px] font-semibold text-[#111827]">
                  {field.label}
                </span>
                <span className="relative mt-2 block">
                  <input
                    type="password"
                    defaultValue="password"
                    className={`h-10 w-full rounded-[2px] border bg-white px-4 pr-10 text-[12px] font-medium text-[#667085] outline-none focus:ring-2 ${
                      field.invalid
                        ? "border-[#FF4D5E] focus:border-[#FF4D5E] focus:ring-[#FF4D5E]/15"
                        : "border-[#B8C0CC] focus:border-[#292D73] focus:ring-[#292D73]/15"
                    }`}
                  />
                  <Eye className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
                </span>
              </label>
            ))}
          </div>

          <ul className="space-y-2">
            {passwordRules.map((rule) => (
              <li
                key={rule.text}
                className={`text-[12px] font-medium ${
                  rule.valid ? "text-[#098A45]" : "text-[#E11D48]"
                }`}
              >
                {rule.valid ? "✓" : "✕"} {rule.text}
              </li>
            ))}
          </ul>

          <div className="flex justify-end gap-3 pt-8">
            <button
              type="button"
              className="h-10 rounded-[4px] border border-[#8A94A6] px-4 text-[12px] font-semibold text-[#475467] transition hover:bg-[#F8FAFC]"
            >
              Discard Changes
            </button>
            <button
              type="button"
              className="h-10 rounded-[4px] bg-[#292D73] px-5 text-[12px] font-extrabold text-white transition hover:bg-[#20255F]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </AccountPanel>
    </AccountPageShell>
  );
};

export default ChangePasswordContainer;
