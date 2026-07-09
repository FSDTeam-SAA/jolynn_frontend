"use client";

import {
  useState,
  useRef,
  useEffect,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function OtpForm() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const decodedEmail = decodeURIComponent(email || "");
  const router = useRouter();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const { mutate, isPending } = useMutation({
    mutationKey: ["verify-otp"],
    mutationFn: (values: { otp: string; email: string }) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(values),
      }).then((res) => res.json()),
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message || "Something went wrong");
        return;
      }
      toast.success(data?.message || "OTP verified successfully!");
      router.push(`/change-password?email=${encodeURIComponent(decodedEmail)}&otp=${encodeURIComponent(otp.join(""))}`);
    },
  });

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.error("Please enter all 6 digits of the OTP.");
      return;
    }
    mutate({ otp: otpValue, email: decodedEmail });
  };

  const resendOtp = useMutation({
    mutationKey: ["forgot-password"],
    mutationFn: (email: string) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }).then((res) => res.json()),

    onSuccess: (data, email) => {
      if (!data?.success) {
        toast.error(data?.message || "Something went wrong");
        return;
      }

      toast.success(data?.message || "Email sent successfully!");
      router.push(`/enter-otp?email=${encodeURIComponent(email)}`);
    },

    onError: (error) => {
      toast.error("Something went wrong. Please try again.");
      console.error("Forgot password error:", error);
    },
  });



  return (
    <div className="w-full flex items-center justify-center px-4">
     

      <div className="w-full md:w-[547px] p-5 md:p-8 lg:p-10 rounded-[16px] bg-white shadow-[0px_5px_10px_0px_#00000029] flex flex-col items-center space-y-8">

          <div className="flex items-center justify-center mb-0">
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

        <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-primary text-center leading-[120%]">
          Verify Email
        </h3>
        {/* OTP Input Fields */}
        <div className="flex justify-center gap-2 md:gap-4 lg:gap-6">
          {otp.map((digit, index) => (
            <Input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              className={`w-11 h-12 md:w-14 md:h-16 text-center text-xl font-semibold rounded-lg border ${digit
                  ? "border-primary text-primary"
                  : "border-[#F5F3FA] placeholder:text-[#667481] shadow-[0px_0px_10px_0px_#00000026]"
                } focus:ring-2 focus:ring-primary] focus:border-primary transition-all`}
              aria-label={`OTP digit ${index + 1}`}
            />
          ))}
        </div>

        {/* Resend Option */}
        <p className="text-sm md:text-base text-[#4365D0] text-center">
          Didn’t get a code?{" "}
          <button
            onClick={() => resendOtp.mutate(decodedEmail)}
            className="text-primary  font-medium hover:underline"
          >
            {resendOtp.isPending ? "Resending..." : "Resend"}
          </button>
        </p>

        {/* Verify Button */}
        <Button
          disabled={isPending}
          onClick={handleVerify}
           className="text-base font-semibold text-white leading-[120%] rounded-[8px] w-full h-[48px] bg-primary"
        >
          {isPending ? "Verifying..." : "Verify Now"}
        </Button>

        
      </div>
    </div>
  );
}
