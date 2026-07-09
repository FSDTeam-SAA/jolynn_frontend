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

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});
type FormValues = z.input<typeof formSchema>;

const ForgotPasswordForm = () => {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const { mutate, isPending } = useMutation({
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




  const onSubmit = (values: FormValues) => {
    mutate(values.email);
  };

  return (
    <div>
      <h3 className="text-2xl mb-16 md:text-[28px] lg:text-[32px] font-extrabold text-[#82B7B4] text-center leading-[120%]">
        Forgot Password
      </h3>

      <div className="w-full md:w-[547px] p-3 md:p-7 lg:p-8 rounded-[16px] bg-white shadow-[0px_5px_10px_0px_#00000029]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-5 md:pt-6">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1 text-base font-medium leading-[120%] text-[#499FC0] pb-2">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className="w-full h-[48px] text-base font-medium leading-[120%] text-[#293440] rounded-[8px] p-4 border border-[#0000004D] placeholder:text-[#787878]"
                      placeholder="Enter your Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <Button
              disabled={isPending}
              className="text-base font-medium text-[#F8FAF9] leading-[120%] rounded-[8px] w-full h-[48px] bg-primary"
              type="submit"
            >
              {isPending ? "Sending..." : "Send "}
            </Button>
          </form>
        </Form>
      </div>
      
    </div>
  );
};

export default ForgotPasswordForm;
