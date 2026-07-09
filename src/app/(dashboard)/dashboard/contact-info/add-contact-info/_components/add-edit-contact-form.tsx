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
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Save, Plus, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Textarea } from "@/components/ui/textarea";
import {
  ContactInfoFormType,
  contactInfoSchema,
} from "@/schema/addContactInfo";

type ContactInfo = {
  _id: string;
  address: string;
  email: string;
  openingHours: string;
  phoneNumbers: string[];
};

interface Props {
  id?: string;
  contactInfoData?: ContactInfo;
}

const AddEditContactInfo = ({ id, contactInfoData }: Props) => {
  const pathName = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useSession();
  const token = (session?.data?.user as { token: string })?.token;

  const form = useForm<ContactInfoFormType>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      address: "",
      email: "",
      openingHours: "",
      phoneNumbers: [""],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "phoneNumbers" as never,
  });

  useEffect(() => {
    if (
      pathName !== "/dashboard/contact-info/add-contact-info" &&
      contactInfoData
    ) {
      form.reset({
        address: contactInfoData?.address || "",
        email: contactInfoData?.email || "",
        openingHours: contactInfoData?.openingHours || "",
        phoneNumbers:
          contactInfoData?.phoneNumbers?.length > 0
            ? contactInfoData.phoneNumbers
            : [""],
      });
    }
  }, [pathName, contactInfoData, form]);

  const { mutateAsync, isPending } = useMutation<any, any, ContactInfoFormType>(
    {
      mutationKey: ["contact-info"],
      mutationFn: async (data) => {
        const isAdd = pathName === "/dashboard/contact-info/add-contact-info";
        const method = isAdd ? "POST" : "PUT";
        const url = isAdd
          ? `${process.env.NEXT_PUBLIC_API_URL}/contact-info`
          : `${process.env.NEXT_PUBLIC_API_URL}/contact-info/${id}`;

        const res = await fetch(url, {
          method,
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Failed to save contact info");
        return res.json();
      },

      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["all-contact-info"] });
        toast.success(data.message || "Contact information saved successfully");
        router.push("/dashboard/contact-info");
        form.reset();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to save contact information");
      },
    }
  );

  const onSubmit = async (value: ContactInfoFormType) => {
    try {
      await mutateAsync(value);
    } catch (error) {
      console.log(`Error saving contact info: ${error}`);
    }
  };

  const addPhoneNumber = () => {
    append("");
  };

  const removePhoneNumber = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast.error("At least one phone number is required");
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Address Field */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Enter full address"
                    className="min-h-[80px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    {...field}
                    placeholder="Enter email address"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Opening Hours Field */}
          <FormField
            control={form.control}
            name="openingHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opening Hours</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="e.g., Monday - Friday: 9:00 AM - 6:00 PM"
                    className="min-h-[60px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone Numbers Array */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Phone Numbers</h3>
              <Button
                type="button"
                onClick={addPhoneNumber}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Phone Number
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-3 items-start">
                <FormField
                  control={form.control}
                  name={`phoneNumbers.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Phone Number {index + 1}</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          {...field}
                          placeholder="Enter phone number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  onClick={() => removePhoneNumber(index)}
                  variant="destructive"
                  size="sm"
                  className="mt-8"
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-[50px] mt-6 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Spinner /> Save
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" /> Save Contact Information
              </span>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AddEditContactInfo;
