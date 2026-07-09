/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { addFaqSchema } from "@/schema/addFaqSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { RichTextEditor } from "../../../_component/shared/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "next-auth/react";

type formType = z.input<typeof addFaqSchema>;

interface Faq {
  _id: string;
  question: string;
  answer: string;
}

interface Props {
  id?: string;
  faqDetails?: Faq;
}

const AddEditFaq = ({ id, faqDetails }: Props) => {
  const pathName = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useSession();
  const token = (session?.data?.user as { token: string })?.token;

  const form = useForm<formType>({
    resolver: zodResolver(addFaqSchema),
    defaultValues: {
      question: "",
      answer: "",
    },
  });

  useEffect(() => {
    if (pathName !== "/dashboard/faq/add-faq" && faqDetails) {
      form.reset({
        question: faqDetails?.question || "",
        answer: faqDetails?.answer || "",
      });
    }
  }, [pathName, faqDetails, form]);

  const { mutateAsync, isPending } = useMutation<any, any, formType>({
    mutationKey: ["add-faq"],
    mutationFn: async (data) => {
      const isAdd = pathName === "/dashboard/faq/add-faq";
      const method = isAdd ? "POST" : "PUT";
      const url = isAdd
        ? `${process.env.NEXT_PUBLIC_API_URL}/faqs`
        : `${process.env.NEXT_PUBLIC_API_URL}/faqs/${id}`;

      const res = await fetch(url, {
        method,
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      return res.json();
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["all-faq"] });
      toast.success(data.message);
      router.push('/dashboard/faq')
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (value: formType) => {
    try {
      await mutateAsync(value);
    } catch (error) {
      console.log(`error from add price list : ${error}`);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* priceName field */}
          <FormField
            control={form.control}
            name="question"
            render={({ field }) => (
              <FormItem>
                <FormLabel>FAQ Question</FormLabel>

                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    placeholder="Enter price name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="answer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>FAQ Answer</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value || ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-[50px] mt-5 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <span className="flex items-center gap-1">
                <Spinner /> Save
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Save /> Save
              </span>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AddEditFaq;
