"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const formSchema = z.object({
  identifier: z.string().min(1, "Please enter your email or username"),
});
type FormValues = z.input<typeof formSchema>;

const ForgotPasswordForm = () => {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["forgot-password"],
    mutationFn: (identifier: string) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier }),
      }).then((res) => res.json()),

    onSuccess: (data, identifier) => {
      if (!data?.success) {
        toast.error(data?.message || "Something went wrong");
        return;
      }

      toast.success(data?.message || "Email sent successfully!");
      router.push(`/enter-otp?email=${encodeURIComponent(identifier)}`);
    },

    onError: (error) => {
      toast.error("Something went wrong. Please try again.");
      console.error("Forgot password error:", error);
    },
  });




  const onSubmit = (values: FormValues) => {
    mutate(values.identifier);
  };

  return (
    <div className="w-full flex items-center justify-center px-4">

      <div className="w-full md:w-[547px] p-3 md:p-7 lg:p-8 rounded-[16px] bg-white shadow-[0px_5px_10px_0px_#00000029]">
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

        <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-primary text-center leading-[120%]">
          Forgot Password
        </h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-5 md:pt-6">
            {/* Email / Username Field */}
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1 text-base font-semibold leading-[120%] text-[#4365D0] pb-2">
                    Email / Username
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="w-full h-[48px] text-base font-medium leading-[120%] text-primary rounded-[8px] p-4 border border-[#F5F3FA] placeholder:text-[#667481] shadow-[0px_0px_10px_0px_#00000026]"
                      placeholder="Type your Email / Username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <Button
              disabled={isPending}
              className="text-base font-semibold text-white leading-[120%] rounded-[8px] w-full h-[48px] bg-primary"
              type="submit"
            >
              {isPending ? "Sending..." : "Send OTP"}
            </Button>
          </form>
        </Form>
      </div>
      
    </div>
  );
};

export default ForgotPasswordForm;
