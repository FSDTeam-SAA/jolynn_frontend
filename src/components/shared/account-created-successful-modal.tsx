import { MailCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type AccountCreatedSuccessfulModalProps = {
  open: boolean;
  email: string;
};

const AccountCreatedSuccessfulModal = ({
  open,
  email,
}: AccountCreatedSuccessfulModalProps) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/60 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-created-title"
    >
      <div className="w-full max-w-[520px] overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_28px_80px_rgba(16,24,40,0.3)]">
        <div className="h-1.5 bg-[linear-gradient(90deg,#292D73_0%,#5962B8_55%,#75B8AE_100%)]" />
        <div className="px-6 py-8 text-center sm:px-10 sm:py-10">
          <Link
            href="/"
            aria-label="Go to home page"
            className="mx-auto inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4365D0] focus-visible:ring-offset-2"
          >
            <Image
              src="/assets/images/logo.png"
              alt="Logo"
              width={64}
              height={64}
              className="h-16 w-16 object-contain"
            />
          </Link>

          <p className="mt-6 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#667085]">
            Registration complete
          </p>
          <h2
            id="account-created-title"
            className="mt-2 text-2xl font-extrabold leading-tight text-[#171A3A] sm:text-[30px]"
          >
            Account Created Successfully!
          </h2>
          <p className="mx-auto mt-3 max-w-[410px] text-sm leading-6 text-[#667085]">
            Your account is ready. We sent a verification email to the address
            below.
          </p>

          <div className="mx-auto mt-6 flex max-w-[420px] items-center gap-3 rounded-xl border border-[#DDE4F0] bg-[#F8FAFC] px-4 py-3.5 text-left">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF1FF] text-[#4365D0]">
              <MailCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#98A2B3]">
                Verification email sent to
              </p>
              <p className="mt-0.5 break-words text-sm font-bold text-[#292D73] [overflow-wrap:anywhere]">
                {email || "Your email address"}
              </p>
            </div>
          </div>

          <p className="mx-auto mt-5 max-w-[410px] text-xs leading-5 text-[#667085]">
            Open the email and follow the verification link to activate your
            account. If it isn&apos;t in your inbox, please check your spam or junk
            folder.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountCreatedSuccessfulModal;
