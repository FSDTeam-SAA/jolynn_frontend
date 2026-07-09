/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  addGallerySchema,
  AddGalleryFormType,
} from "@/schema/addGallerySchema";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ImageUp, X, Save } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface GalleryItem {
  before: {
    imageName: string;
    cloudinaryId?: string;
  };
  after: {
    imageName: string;
    cloudinaryId?: string;
  };
}

interface Props {
  id?: string;
  galleryDetails?: GalleryItem;
}

const AddEditGallery = ({ id, galleryDetails }: Props) => {
  const [beforeImagePreview, setBeforeImagePreview] = useState<string | null>(
    null
  );
  const [afterImagePreview, setAfterImagePreview] = useState<string | null>(
    null
  );
  const pathName = usePathname();
  const router = useRouter();
  const session = useSession();
  const token = (session?.data?.user as { token: string })?.token;

  const form = useForm<AddGalleryFormType>({
    resolver: zodResolver(addGallerySchema),
    defaultValues: {
      before: {
        imageFile: undefined,
      },
      after: {
        imageFile: undefined,
      },
    },
  });

  useEffect(() => {
    if (
      pathName !== "/dashboard/gallery-management/add-gallery" &&
      galleryDetails
    ) {
      if (galleryDetails?.before?.imageName) {
        setBeforeImagePreview(galleryDetails?.before?.imageName);
      }
      if (galleryDetails?.after?.imageName) {
        setAfterImagePreview(galleryDetails?.after?.imageName);
      }

      form.reset({
        before: {
          imageFile: undefined,
        },
        after: {
          imageFile: undefined,
        },
      });
    }
  }, [pathName, galleryDetails, form]);

  const { mutateAsync, isPending } = useMutation<any, unknown, FormData>({
    mutationKey: ["add-gallery"],
    mutationFn: async (payload: FormData) => {
      const isAdd = pathName === "/dashboard/gallery-management/add-gallery";
      const method = isAdd ? "POST" : "PUT";
      const url = isAdd
        ? `${process.env.NEXT_PUBLIC_API_URL}/galleries`
        : `${process.env.NEXT_PUBLIC_API_URL}/galleries/${id}`;

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      return await res.json();
    },

    onSuccess: (data) => {
      toast.success(data?.message);
      router.push("/dashboard/gallery-management");
    },

    onError: (err: any) => {
      const message = err?.error ?? err?.message ?? "Something went wrong";
      toast.error(String(message));
    },
  });

  const onSubmit = async (data: AddGalleryFormType) => {
    const formData = new FormData();

    // Append before image file
    if (data.before.imageFile instanceof File) {
      formData.append("before", data.before.imageFile);
    }

    // Append after image file
    if (data.after.imageFile instanceof File) {
      formData.append("after", data.after.imageFile);
    }

    try {
      await mutateAsync(formData);
      // Reset form after successful submission if it's an add operation
      if (pathName === "/dashboard/gallery-management/add-gallery") {
        form.reset();
        setBeforeImagePreview(null);
        setAfterImagePreview(null);
      }
    } catch (error) {
      console.log(`error from add gallery : ${error}`);
    }
  };

  const clearBeforeSelection = () => {
    setBeforeImagePreview(null);
    form.setValue("before.imageFile", undefined);
  };

  const clearAfterSelection = () => {
    setAfterImagePreview(null);
    form.setValue("after.imageFile", undefined);
  };

  const handleImageUpload = (
    file: File,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>,
    field: any
  ) => {
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
      field.onChange(file);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Before Section */}
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Before Image</h3>

            {/* Before Image Upload */}
            <FormField
              control={form.control}
              name="before.imageFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Before Image</FormLabel>
                  <FormControl>
                    <div className="border border-gray-300 p-4 rounded-lg">
                      {beforeImagePreview ? (
                        <div className="relative">
                          <Image
                            src={beforeImagePreview}
                            alt="Before Preview"
                            width={1000}
                            height={1000}
                            className="max-h-56 object-contain rounded"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-white border"
                            onClick={clearBeforeSelection}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <input
                            type="file"
                            id="before-image-upload"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(
                                  file,
                                  setBeforeImagePreview,
                                  field
                                );
                              }
                            }}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            type="button"
                            onClick={() =>
                              document
                                .getElementById("before-image-upload")
                                ?.click()
                            }
                            className="w-full h-52 border-2 border-dashed border-gray-300 flex items-center justify-center"
                          >
                            <div className="flex flex-col items-center gap-2 opacity-50">
                              <ImageUp size={50} />
                              <span>Upload Before Image</span>
                            </div>
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* After Section */}
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">After Image</h3>

            {/* After Image Upload */}
            <FormField
              control={form.control}
              name="after.imageFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload After Image</FormLabel>
                  <FormControl>
                    <div className="border border-gray-300 p-4 rounded-lg">
                      {afterImagePreview ? (
                        <div className="relative">
                          <Image
                            src={afterImagePreview}
                            alt="After Preview"
                            width={1000}
                            height={1000}
                            className="max-h-56 object-contain rounded"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-white border"
                            onClick={clearAfterSelection}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <input
                            type="file"
                            id="after-image-upload"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(
                                  file,
                                  setAfterImagePreview,
                                  field
                                );
                              }
                            }}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            type="button"
                            onClick={() =>
                              document
                                .getElementById("after-image-upload")
                                ?.click()
                            }
                            className="w-full h-52 border-2 border-dashed border-gray-300 flex items-center justify-center"
                          >
                            <div className="flex flex-col items-center gap-2 opacity-50">
                              <ImageUp size={50} />
                              <span>Upload After Image</span>
                            </div>
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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

export default AddEditGallery;
