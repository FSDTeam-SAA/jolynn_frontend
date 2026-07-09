

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
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
import { Eye, EyeOff } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const formSchema = z
    .object({
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type FormValues = z.infer<typeof formSchema>;

const ChangePasswordBody = () => {
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    const email = searchParams.get("email");
    const otp = searchParams.get("otp");
    const decodedEmail = decodeURIComponent(email || "");
    const decodedOtp = decodeURIComponent(otp || "");

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });

    const { mutate, isPending } = useMutation({
        mutationKey: ["change-password"],
        mutationFn: async (values: { newPassword: string; email: string, otp: string }) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/update-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });
            return res.json();
        },
        onSuccess: (data) => {
            if (!data?.status) {
                toast.error(data?.message || "Something went wrong");
                return;
            }
            toast.success(data?.message || "Password changed successfully!");
            router.push("/login");
        },
        onError: () => {
            toast.error("Something went wrong. Please try again.");
        },
    });

    const onSubmit = (values: FormValues) => {
        mutate({
            newPassword: values.newPassword,
            email: decodedEmail,
            otp: decodedOtp
        });
    };

    return (
        <div>
            <h3 className="text-2xl mb-16 md:text-[28px] lg:text-[32px] font-extrabold text-[#82B7B4] text-center leading-[120%]">
                Change Your Password
            </h3>

            <div className="w-full md:w-[547px] p-3 md:p-7 lg:p-8 rounded-[16px] bg-white shadow-[0px_5px_10px_0px_#00000029]">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6 pt-5 md:pt-6"
                    >
                        {/* New Password Field */}
                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-medium text-[#82B7B4] pb-2">
                                        New Password
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showNewPassword ? "text" : "password"}
                                                placeholder="Enter new password"
                                                className="w-full h-[48px] text-base font-medium text-[#293440] rounded-[8px] p-4 border border-[#0000004D] placeholder:text-[#787878]"
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                onClick={() => setShowNewPassword((prev) => !prev)}
                                                tabIndex={-1}
                                            >
                                                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-red-500" />
                                </FormItem>
                            )}
                        />

                        {/* Confirm Password Field */}
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-medium text-[#82B7B4] pb-2">
                                        Confirm Password
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm your password"
                                                className="w-full h-[48px] text-base font-medium text-[#293440] rounded-[8px] p-4 border border-[#0000004D] placeholder:text-[#787878]"
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                                tabIndex={-1}
                                            >
                                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
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
                            {isPending ? "Submitting..." : "Change Password"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default ChangePasswordBody;
