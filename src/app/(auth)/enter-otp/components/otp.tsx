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
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/verify-otp`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(values),
      }).then((res) => res.json()),
    onSuccess: (data) => {
      if (!data?.status) {
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
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }).then((res) => res.json()),

    onSuccess: (data, email) => {
      if (!data?.status) {
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
    <div>
      <h3 className="text-2xl md:text-[28px] lg:text-[32px] font-extrabold text-[#82B7B4] text-center leading-[120%] mb-10">
        Verify OTP
      </h3>

      <div className="w-full md:w-[547px] p-5 md:p-8 lg:p-10 rounded-[16px] bg-white shadow-[0px_5px_10px_0px_#00000029] flex flex-col items-center space-y-8">
        {/* OTP Input Fields */}
        <div className="flex justify-center gap-3 md:gap-4">
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
              className={`w-12 h-14 md:w-14 md:h-16 text-center text-xl font-semibold rounded-lg border ${digit
                  ? "border-[#499FC0] text-[#499FC0]"
                  : "border-[#D1D5DB] text-gray-700"
                } focus:ring-2 focus:ring-[#499FC0] focus:border-[#499FC0] transition-all`}
              aria-label={`OTP digit ${index + 1}`}
            />
          ))}
        </div>

        {/* Verify Button */}
        <Button
          disabled={isPending}
          onClick={handleVerify}
          className="text-base font-medium text-[#F8FAF9] leading-[120%] rounded-[8px] w-full h-[48px] bg-primary transition-all"
        >
          {isPending ? "Verifying..." : "Verify"}
        </Button>

        {/* Resend Option */}
        <p className="text-sm text-[#82B7B4] text-center">
          Didn’t receive the code?{" "}
          <button
            onClick={() => resendOtp.mutate(decodedEmail)}
            className="text-[#82B7B4]  font-medium hover:underline"
          >
            {resendOtp.isPending ? "Resending..." : "Resend"}
          </button>
        </p>
      </div>
    </div>
  );
}
