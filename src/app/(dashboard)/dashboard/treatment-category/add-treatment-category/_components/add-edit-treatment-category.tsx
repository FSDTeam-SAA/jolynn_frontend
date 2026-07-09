/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { addTreatmentCategorySchema } from "@/schema/addTreatmentCategorySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Save, ImageUp, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "next-auth/react";
import { AddTreatmentCategoryType } from "@/schema/addTreatmentCategorySchema";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

type TreatmentCategory = {
  _id: string;
  name: string;
  image: string;
  createdAt: string;
  updatedAt: string;
};

interface Props {
  categoryDetails?: TreatmentCategory;
  id?: string;
}

export const AddEditTreatmentCategory = ({ categoryDetails, id }: Props) => {
  const queryClient = useQueryClient();
  const pathName = usePathname();
  const router = useRouter();
  const session = useSession();
  const token = (session?.data?.user as { token: string })?.token;
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<AddTreatmentCategoryType>({
    resolver: zodResolver(addTreatmentCategorySchema),
    defaultValues: {
      name: "",
      image: "",
    },
  });

  useEffect(() => {
    if (
      pathName !== "/dashboard/treatment-category/add-treatment-category" &&
      categoryDetails
    ) {
      form.reset({
        name: categoryDetails?.name || "",
        image: categoryDetails?.image || "",
      });
      setImagePreview(categoryDetails?.image || null);
    }
  }, [pathName, categoryDetails, form]);

  const { mutateAsync, isPending } = useMutation<any, any, FormData>({
    mutationKey: ["add-edit-treatment-category"],
    mutationFn: async (formData) => {
      const isAdd =
        pathName === "/dashboard/treatment-category/add-treatment-category";
      const method = isAdd ? "POST" : "PUT";
      const url = isAdd
        ? `${process.env.NEXT_PUBLIC_API_URL}/treatmentCategories`
        : `${process.env.NEXT_PUBLIC_API_URL}/treatmentCategories/${id}`;

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error(
          `Failed to ${isAdd ? "add" : "update"} treatment category`
        );
      }

      return res.json();
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["all-treatment-categories"] });
      toast.success(
        data.message ||
          `Treatment category ${
            pathName === "/dashboard/treatment-category" ? "added" : "updated"
          } successfully`
      );

      router.push('/dashboard/treatment-category')

      if (pathName === "/dashboard/treatment-category") {
        form.reset();
        setImagePreview(null);
        setImageFile(null);
      }
    },
    onError: (error) => {
      toast.error(
        error.message ||
          `Failed to ${
            pathName === "/dashboard/treatment-category" ? "add" : "update"
          } treatment category`
      );
    },
  });

  const onSubmit = async (value: AddTreatmentCategoryType) => {
    try {
      const formData = new FormData();
      formData.append("name", value.name);

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (value.image) {
        formData.append("image", value.image);
      } else {
        toast.error("Please select an image");
        return;
      }

      await mutateAsync(formData);
    } catch (error) {
      console.log(
        `error from ${
          pathName === "/dashboard/treatment-category" ? "add" : "edit"
        } treatment category: ${error}`
      );
    }
  };

  const handleImageChange = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setImageFile(file);
      form.setValue("image", "image-selected", { shouldValidate: true });
    }
  };

  const clearImageSelection = () => {
    setImagePreview(null);
    setImageFile(null);
    form.setValue("image", "", { shouldValidate: true });
  };

  const isImageSelected = imagePreview || form.watch("image");

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6">
        {pathName === "/dashboard/treatment-category"
          ? "Add Treatment Category"
          : "Edit Treatment Category"}
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Name field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    placeholder="Enter category name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image Upload - Using hidden input for form validation */}
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Image</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    {/* Hidden input for form validation */}
                    <input
                      type="hidden"
                      {...field}
                      value={isImageSelected ? "image-selected" : ""}
                    />

                    {/* Image Upload Section */}
                    <div className="border border-gray-400 p-5 rounded-lg">
                      {imagePreview ? (
                        <div className="relative">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            width={1000}
                            height={1000}
                            className="max-h-48 max-w-full object-contain rounded mx-auto"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-white border"
                            onClick={clearImageSelection}
                            type="button"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <input
                            type="file"
                            id="image-upload"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageChange(file);
                              }
                            }}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            className="w-full h-52 border-2 border-dashed border-gray-300 flex items-center justify-center"
                            type="button"
                            onClick={() =>
                              document.getElementById("image-upload")?.click()
                            }
                          >
                            <div className="flex flex-col items-center gap-2 opacity-40">
                              <ImageUp
                                style={{ height: "50px", width: "50px" }}
                              />
                              <span>Upload Image</span>
                            </div>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-[50px] disabled:cursor-not-allowed"
          >
            {isPending ? (
              <span className="flex items-center gap-1">
                <Spinner />
                Saving
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Save />
                Save
              </span>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};
