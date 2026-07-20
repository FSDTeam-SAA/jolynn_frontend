"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { ChangeEvent, useRef, useState } from "react";
import { Clock3, MapPin, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const initialBusiness = {
  name: "Anderson Electric Co.",
  category: "Electricians",
  about:
    "<p>Licensed master electricians serving the Austin metro area for over 15 years. We handle residential and commercial projects — panel upgrades, EV charging installations, whole-home rewiring, and code compliance inspections. All work is insured and backed by a 2-year labor warranty.</p>",
  hours: "Mon–Fri 7am–6pm · Sat 8am–2pm · Emergency 24/7",
  serviceArea: "Austin, Round Rock, Cedar Park, Georgetown, Pflugerville",
};

type Business = typeof initialBusiness;

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

function MyBusiness() {
  const [business, setBusiness] = useState<Business>(initialBusiness);
  const [draft, setDraft] = useState<Business>(initialBusiness);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [coverImage, setCoverImage] = useState("/assets/images/about_hero.jpg");
  const [profileImage, setProfileImage] = useState("/assets/images/review1.png");
  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const openEditor = () => {
    setDraft(business);
    setIsEditOpen(true);
  };

  const updateImage = (
    event: ChangeEvent<HTMLInputElement>,
    setter: (image: string) => void,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setter(String(reader.result));
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const saveBusiness = () => {
    setBusiness(draft);
    setIsEditOpen(false);
  };

  return (
    <>
      <section className="overflow-hidden rounded-[12px] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.02)]">
        <div className="relative h-[230px] w-full sm:h-[270px]">
          <Image
            src={coverImage}
            alt="Business cover"
            fill
            priority
            unoptimized={coverImage.startsWith("data:")}
            className="object-cover"
          />

          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => updateImage(event, setCoverImage)}
          />
          <button
            type="button"
            aria-label="Change cover image"
            onClick={() => coverInputRef.current?.click()}
            className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#30347F] text-white shadow-sm transition-transform hover:scale-105"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>

        <div className="relative px-5 pb-5 pt-[86px] sm:px-6 sm:pt-5">
          <div className="absolute -top-[70px] left-5 sm:left-6">
            <div className="relative">
              <div className="relative h-[140px] w-[140px] overflow-hidden rounded-full border-4 border-white bg-[#F2F4F7] shadow-sm">
                <Image
                  src={profileImage}
                  alt="Business profile"
                  fill
                  unoptimized={profileImage.startsWith("data:")}
                  className="object-cover"
                />
              </div>

              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => updateImage(event, setProfileImage)}
              />
              <button
                type="button"
                aria-label="Change profile image"
                onClick={() => profileInputRef.current?.click()}
                className="absolute bottom-1 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#30347F] text-white shadow-sm transition-transform hover:scale-105"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 sm:ml-[154px] sm:min-h-[72px]">
            <div>
              <h2 className="text-[24px] font-semibold leading-tight text-[#111111]">
                {business.name}
              </h2>
              <p className="mt-1 text-sm text-[#667085]">{business.category}</p>
            </div>
            <button
              type="button"
              aria-label="Edit business details"
              onClick={openEditor}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#172B4D] transition-colors hover:bg-[#F3F4FA] hover:text-[#30347F]"
            >
              <Pencil className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 space-y-6 text-[#101828] sm:mt-4">
            <div>
              <h3 className="mb-1.5 text-base font-semibold">About This Business</h3>
              <div
                className="text-sm leading-6 text-[#1D2939] [&_p]:m-0"
                dangerouslySetInnerHTML={{ __html: business.about }}
              />
            </div>

            <div>
              <h3 className="mb-1.5 text-base font-semibold">Business Hours</h3>
              <p className="flex items-start gap-2 text-sm text-[#667085]">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#30569B]" />
                <span>{business.hours}</span>
              </p>
            </div>

            <div>
              <h3 className="mb-1.5 text-base font-semibold">Service Area</h3>
              <p className="flex items-start gap-2 text-sm text-[#667085]">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#30569B]" />
                <span>{business.serviceArea}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[90vh] max-w-[760px] overflow-y-auto rounded-xl bg-white p-0">
          <DialogHeader className="border-b border-[#EAECF0] px-6 py-5">
            <DialogTitle className="text-xl font-semibold text-[#101828]">
              Edit Business Information
            </DialogTitle>
            <DialogDescription>
              Update the information customers see on your business profile.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 px-6 py-2 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-[#344054]">
              <span>Business name</span>
              <input
                value={draft.name}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, name: event.target.value }))
                }
                className="h-11 w-full rounded-lg border border-[#D0D5DD] px-3 font-normal outline-none transition-shadow focus:border-[#30347F] focus:ring-2 focus:ring-[#30347F]/15"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-[#344054]">
              <span>Business category</span>
              <input
                value={draft.category}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, category: event.target.value }))
                }
                className="h-11 w-full rounded-lg border border-[#D0D5DD] px-3 font-normal outline-none transition-shadow focus:border-[#30347F] focus:ring-2 focus:ring-[#30347F]/15"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-[#344054] sm:col-span-2">
              <span>About This Business</span>
              <div className="overflow-hidden rounded-lg bg-white [&_.ql-container]:min-h-[180px] [&_.ql-editor]:min-h-[180px]">
                <ReactQuill
                  theme="snow"
                  value={draft.about}
                  onChange={(about) => setDraft((current) => ({ ...current, about }))}
                  modules={quillModules}
                  placeholder="Write about your business..."
                />
              </div>
            </label>

            <label className="space-y-2 text-sm font-medium text-[#344054] sm:col-span-2">
              <span>Business hours</span>
              <input
                value={draft.hours}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, hours: event.target.value }))
                }
                className="h-11 w-full rounded-lg border border-[#D0D5DD] px-3 font-normal outline-none transition-shadow focus:border-[#30347F] focus:ring-2 focus:ring-[#30347F]/15"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-[#344054] sm:col-span-2">
              <span>Service area</span>
              <input
                value={draft.serviceArea}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    serviceArea: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-lg border border-[#D0D5DD] px-3 font-normal outline-none transition-shadow focus:border-[#30347F] focus:ring-2 focus:ring-[#30347F]/15"
              />
            </label>
          </div>

          <DialogFooter className="gap-3 border-t border-[#EAECF0] px-6 py-4 sm:space-x-0">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="h-10 cursor-pointer rounded-lg border border-[#D0D5DD] px-5 text-sm font-medium text-[#344054] hover:bg-[#F9FAFB]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveBusiness}
              className="h-10 cursor-pointer rounded-lg bg-[#30347F] px-5 text-sm font-medium text-white hover:bg-[#252966]"
            >
              Save changes
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default MyBusiness;
