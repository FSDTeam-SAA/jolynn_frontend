import { CircleCheck } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[linear-gradient(180deg,_#292D73_0%,_#91C7D9_50%,_#CBE4E3_100%),_linear-gradient(0deg,_rgba(0,0,0,0.2),_rgba(0,0,0,0.2))] px-4 md:px-0 ">
      <div className="w-full max-w-[720px] rounded-[12px] bg-white px-5 py-6 md:py-8 lg:py-10 text-center shadow-[0_16px_30px_rgba(17,24,39,0.22)] sm:px-10 md:px-12 ">
       <div className="flex items-center justify-center mb-4">
          <Link href="/">
            <Image
              src="/assets/images/logo.png"
              alt="Logo"
              width={100}
              height={100}
              className="w-[90px] h-[90px]"
            />
          </Link>
        </div>

        <h2 className="mt-3 md:mt-4 lg:mt-6 text-2xl md:text-3xl lg:text-4xl xl:text-[40px] font-bold leading-normal text-primary">
          Account Created!
        </h2>

        <div className="mx-auto mt-4 md:mt-6 lg:mt-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#ECFDF5]">
          <CircleCheck className="h-10 w-10 text-[#00B67A]" />
        </div>

        <p className="mx-auto mt-4 md:mt-6 lg:mt-8 max-w-[470px] text-xs md:text-sm xl:text-base font-semibold leading-[1.25] text-[#4365D0]">
          We&apos;ve sent a verification email to {email || "your email"}.
          Click the link to activate your account.
        </p>

        <Link
          href="/login"
          className="mx-auto mt-5 md:mt-7 lg:mt-10 flex h-12 w-full max-w-[560px] items-center justify-center rounded-[6px] bg-primary text-sm md:text-base font-semibold leading-normal text-white transition hover:bg-[#20255F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73] focus-visible:ring-offset-2"
        >
          Go to Sign In
        </Link>
      </div>
    </div>
  );
};

export default AccountCreatedSuccessfulModal;
