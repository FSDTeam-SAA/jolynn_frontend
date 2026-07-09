"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Save } from "lucide-react";

const privacyPolicySchema = z.object({
  gdprContent: z.string().min(1, "Privacy policy content is required"),
});

type FormType = z.infer<typeof privacyPolicySchema>;

import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

interface Props {
  gdpr?: {
    _id: string;
    gdprContent: string;
  };
}

const EditGdpr = ({ gdpr }: Props) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const session = useSession();
  const token = (session?.data?.user as { token: string })?.token;

  const form = useForm<FormType>({
    resolver: zodResolver(privacyPolicySchema),
    defaultValues: {
      gdprContent: "",
    },
  });

  useEffect(() => {
    if (gdpr) {
      form.reset({
        gdprContent: gdpr?.gdprContent || "",
      });
    }
  }, [gdpr, form]);

  const { mutateAsync, isPending } = useMutation<any, any, FormType>({
    mutationKey: ["gdpr"],
    mutationFn: async (data) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gdpr/update`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update privacy policy");
      }

      return res.json();
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["privacy-policy"] });
      toast.success(data.message);
      router.push("/dashboard/gdpr");
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (value: FormType) => {
    try {
      await mutateAsync(value);
    } catch (error) {
      console.log(`error from privacy policy : ${error}`);
    }
  };

  // React Quill modules configuration
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["blockquote", "code-block"],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "script",
    "list",
    "bullet",
    "indent",
    "align",
    "blockquote",
    "code-block",
    "link",
    "image",
    "video",
  ];

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Content field */}
          <FormField
            control={form.control}
            name="gdprContent"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div>
                    <ReactQuill
                      theme="snow"
                      value={field.value}
                      onChange={field.onChange}
                      modules={modules}
                      formats={formats}
                      placeholder="Enter your gdpr content here..."
                      className="h-96 mb-12"
                    />
                  </div>
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

export default EditGdpr;
