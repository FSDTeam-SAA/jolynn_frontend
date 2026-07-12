import { CircleCheck, Quote } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#292D73] via-[#79B9D2] to-[#DFF0EE] px-4 py-8">
      <div className="w-full max-w-[720px] rounded-[12px] bg-white px-5 py-10 text-center shadow-[0_16px_30px_rgba(17,24,39,0.22)] sm:px-10 md:px-12 md:py-12">
        <div className="mx-auto flex h-[78px] w-[78px] items-center justify-center rounded-full bg-[#0987D9] text-white">
          <Quote className="h-10 w-10 fill-white" />
        </div>

        <h2 className="mt-8 text-[30px] font-extrabold leading-tight text-[#292D73] sm:text-[38px]">
          Account Created!
        </h2>

        <div className="mx-auto mt-8 flex h-[78px] w-[78px] items-center justify-center rounded-full bg-[#E8FFF4]">
          <CircleCheck className="h-10 w-10 text-[#00B67A]" />
        </div>

        <p className="mx-auto mt-8 max-w-[430px] text-[14px] font-extrabold leading-[1.25] text-[#315CFF]">
          We&apos;ve sent a verification email to {email || "your email"}.
          Click the link to activate your account.
        </p>

        <Link
          href="/login"
          className="mx-auto mt-10 flex h-12 w-full max-w-[560px] items-center justify-center rounded-[6px] bg-[#292D73] text-[14px] font-extrabold text-white transition hover:bg-[#20255F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73] focus-visible:ring-offset-2"
        >
          Go to Sign In
        </Link>
      </div>
    </div>
  );
};

export default AccountCreatedSuccessfulModal;
