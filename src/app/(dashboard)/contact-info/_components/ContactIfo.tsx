"use client";

import { FormEvent, useState } from "react";
import { Pencil } from "lucide-react";

type ContactDetails = {
  email: string;
  phone: string;
  website: string;
  streetAddress: string;
};

const initialContactDetails: ContactDetails = {
  email: "example@example.com",
  phone: "+1 (555) 123-4567",
  website: "https://sidequote.com",
  streetAddress: "1234 Oak Avenue, San Francisco, CA 94102A",
};

function ContactIfo() {
  const [contactDetails, setContactDetails] =
    useState<ContactDetails>(initialContactDetails);
  const [draft, setDraft] = useState<ContactDetails>(initialContactDetails);
  const [isEditing, setIsEditing] = useState(false);

  const startEditing = () => {
    setDraft(contactDetails);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(contactDetails);
    setIsEditing(false);
  };

  const saveContactDetails = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setContactDetails(draft);
    setIsEditing(false);
  };

  const fieldClassName = `h-[38px] w-full rounded-[2px] border border-[#C9CDD2] bg-white px-3 text-[13px] text-[#5F6368] outline-none transition-shadow placeholder:text-[#858A91] ${
    isEditing
      ? "focus:border-[#30347F] focus:ring-2 focus:ring-[#30347F]/10"
      : "cursor-default"
  }`;

  return (
    <section className="rounded-[9px] bg-white px-4 pb-4 pt-3.5 sm:px-5 sm:pb-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-[18px] font-medium text-[#202124]">Information</h1>
        {!isEditing && (
          <button
            type="button"
            aria-label="Edit contact information"
            onClick={startEditing}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#172B4D] transition-colors hover:bg-[#F3F4FA] hover:text-[#30347F]"
          >
            <Pencil className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>

      <form onSubmit={saveContactDetails}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <label className="space-y-2 text-xs font-medium text-[#3F444A]">
            <span>Email Address</span>
            <input
              type="email"
              required
              readOnly={!isEditing}
              value={draft.email}
              onChange={(event) =>
                setDraft((current) => ({ ...current, email: event.target.value }))
              }
              className={fieldClassName}
            />
          </label>

          <label className="space-y-2 text-xs font-medium text-[#3F444A]">
            <span>Phone Number</span>
            <input
              type="tel"
              required
              readOnly={!isEditing}
              value={draft.phone}
              onChange={(event) =>
                setDraft((current) => ({ ...current, phone: event.target.value }))
              }
              className={fieldClassName}
            />
          </label>

          <label className="space-y-2 text-xs font-medium text-[#3F444A]">
            <span>Website</span>
            <input
              type="url"
              required
              readOnly={!isEditing}
              value={draft.website}
              onChange={(event) =>
                setDraft((current) => ({ ...current, website: event.target.value }))
              }
              className={fieldClassName}
            />
          </label>

          <label className="space-y-2 text-xs font-medium text-[#3F444A] lg:col-span-3">
            <span>Street Address</span>
            <textarea
              required
              readOnly={!isEditing}
              rows={3}
              value={draft.streetAddress}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  streetAddress: event.target.value,
                }))
              }
              className={`min-h-[72px] w-full resize-none rounded-[2px] border border-[#C9CDD2] bg-white px-3 py-3 text-[13px] text-[#5F6368] outline-none transition-shadow ${
                isEditing
                  ? "focus:border-[#30347F] focus:ring-2 focus:ring-[#30347F]/10"
                  : "cursor-default"
              }`}
            />
          </label>
        </div>

        {isEditing && (
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={cancelEditing}
              className="h-9 cursor-pointer rounded-[6px] border border-[#30347F] px-5 text-xs font-medium text-[#30347F] transition-colors hover:bg-[#F3F4FA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 cursor-pointer rounded-[6px] bg-[#30347F] px-5 text-xs font-medium text-white transition-colors hover:bg-[#252966]"
            >
              Save Changes
            </button>
          </div>
        )}
      </form>
    </section>
  );
}

export default ContactIfo;
