/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { addTreatmentSchema } from "@/schema/addTreatmentSchema";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "../../../_component/shared/rich-text-editor";
import { Button } from "@/components/ui/button";
import { ImageUp, Plus, Save, X } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "next/navigation";

type FormType = z.infer<typeof addTreatmentSchema>;

type TreatmentCategory = {
  _id: string;
  name: string;
  image: string;
  createdAt: string;
  updatedAt: string;
};

type Treatment = {
  _id: string;
  serviceName: string;
  description: string;
  image: string;
  cloudinaryId: string;
  category: string;
  createdAt: string;
  updatedAt: string;
};

interface Props {
  treatmentDetails?: Treatment;
  id?: string;
}

export const AddEditTreatmentForm = ({ treatmentDetails, id }: Props) => {
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null]);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null]);
  const queryClient = useQueryClient();
  const session = useSession();
  const token = (session?.data?.user as { token: string })?.token;
  const pathName = usePathname();
  const router = useRouter();

  const { data: categories, isLoading: categoriesLoading } = useQuery<
    TreatmentCategory[]
  >({
    queryKey: ["all-treatment-categories"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/treatmentCategories`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch treatment categories");
      const data = await res.json();
      return data.data || [];
    },
  });

  const form = useForm<FormType>({
    resolver: zodResolver(addTreatmentSchema),
    defaultValues: {
      treatments: [
        {
          serviceName: "",
          description: "",
          image: new File([], ""),
          category: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "treatments",
  });

  const getCategoryId = (
    category: string | { _id: string; name: string; image: string }
  ): string => {
    if (typeof category === "string") {
      return category;
    }
    return category?._id || "";
  };

  useEffect(() => {
    if (pathName.includes("/edit-treatment/") && treatmentDetails) {
      form.reset({
        treatments: [
          {
            serviceName: treatmentDetails?.serviceName || "",
            description: treatmentDetails?.description || "",
            image: new File([], ""),
            category: getCategoryId(treatmentDetails.category),
          },
        ],
      });
      setImagePreviews([treatmentDetails?.image || null]);
      setImageFiles([null]);
    }
  }, [pathName, treatmentDetails, form]);

  const { mutateAsync, isPending } = useMutation<any, any, FormData>({
    mutationKey: ["add-edit-treatment"],
    mutationFn: async (formData) => {
      const isAdd = pathName === "/dashboard/treatment-list/add-treatment";
      const method = isAdd ? "POST" : "PUT";
      const url = isAdd
        ? `${process.env.NEXT_PUBLIC_API_URL}/treatments`
        : `${process.env.NEXT_PUBLIC_API_URL}/treatments/${id}`;

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Failed to ${isAdd ? "add" : "update"} treatment`);
      }

      return res.json();
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["all-treatments"] });
      toast.success(data.message);

      router.push("/dashboard/treatment-list");

      if (pathName === "/dashboard/treatments") {
        form.reset();
        setImagePreviews([null]);
        setImageFiles([null]);
      }
    },
    onError: (error) => {
      toast.error(
        error.message ||
          `Failed to ${
            pathName === "/dashboard/treatments" ? "add" : "update"
          } treatment`
      );
    },
  });

  const clearSelection = (index: number) => {
    if (imagePreviews[index]) {
      if (imagePreviews[index]?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviews[index]!);
      }
      setImagePreviews((prev) => {
        const updated = [...prev];
        updated[index] = null;
        return updated;
      });
      setImageFiles((prev) => {
        const updated = [...prev];
        updated[index] = null;
        return updated;
      });
      form.setValue(`treatments.${index}.image`, new File([], ""), {
        shouldValidate: true,
      });
    }
  };

  const handleImageChange = (file: File, index: number) => {
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreviews((prev) => {
        const updated = [...prev];
        updated[index] = imageUrl;
        return updated;
      });
      setImageFiles((prev) => {
        const updated = [...prev];
        updated[index] = file;
        return updated;
      });
      form.setValue(`treatments.${index}.image`, file, {
        shouldValidate: true,
      });
    }
  };

  const onSubmit = async (value: FormType) => {
    try {
      const treatment = value.treatments[0];
      const formData = new FormData();
      formData.append("serviceName", treatment.serviceName);
      formData.append("description", treatment.description);
      formData.append("category", treatment.category);

      if (imageFiles[0] && imageFiles[0].size > 0) {
        formData.append("image", imageFiles[0]);
      } else if (treatmentDetails?.image && !imageFiles[0]) {
        formData.append("image", treatmentDetails.image);
      }

      await mutateAsync(formData);
    } catch (error) {
      console.log(
        `Error ${
          pathName === "/dashboard/treatments" ? "adding" : "updating"
        } treatment:`,
        error
      );
    }
  };

  useEffect(() => {
    if (fields.length > imagePreviews.length) {
      setImagePreviews((prev) => [...prev, null]);
      setImageFiles((prev) => [...prev, null]);
    } else if (fields.length < imagePreviews.length) {
      setImagePreviews((prev) => prev.slice(0, fields.length));
      setImageFiles((prev) => prev.slice(0, fields.length));
    }
  }, [fields.length, imagePreviews.length]);

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6">
        {pathName === "/dashboard/treatments"
          ? "Add Treatment"
          : "Edit Treatment"}
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="border p-5 rounded-lg space-y-5 relative"
            >
              {fields.length > 1 && pathName === "/dashboard/treatments" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 text-red-500"
                  onClick={() => remove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              {/* Service Name */}
              <FormField
                control={form.control}
                name={`treatments.${index}.serviceName`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter service name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Treatment Category */}
              <FormField
                control={form.control}
                name={`treatments.${index}.category`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Treatment Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoriesLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading categories...
                          </SelectItem>
                        ) : categories && categories.length > 0 ? (
                          categories.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-categories" disabled>
                            No categories found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name={`treatments.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <FormField
                control={form.control}
                name={`treatments.${index}.image`}
                render={() => (
                  <FormItem>
                    <FormLabel>Add Image</FormLabel>
                    <FormControl>
                      <div className="border border-gray-400 p-5 rounded-lg">
                        {imagePreviews[index] ? (
                          <div className="relative">
                            <Image
                              src={imagePreviews[index]!}
                              alt="Preview"
                              width={1000}
                              height={1000}
                              className="max-h-48 max-w-full object-contain rounded"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-white border"
                              onClick={() => clearSelection(index)}
                              type="button"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <input
                              type="file"
                              id={`image-upload-${index}`}
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleImageChange(file, index);
                                }
                              }}
                              className="hidden"
                            />
                            <Button
                              variant="outline"
                              className="w-full h-52 border-2 border-dashed border-gray-300 flex items-center justify-center"
                              type="button"
                              onClick={() =>
                                document
                                  .getElementById(`image-upload-${index}`)
                                  ?.click()
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}

          {/* Add More Button - only show in add mode */}
          {pathName === "/dashboard/treatment-list/add-treatment" && (
            <Button
              type="button"
              onClick={() =>
                append({
                  serviceName: "",
                  description: "",
                  image: new File([], ""),
                  category: "",
                })
              }
              className="w-full bg-primary/20 hover:bg-primary/30 text-primary flex items-center justify-center gap-2"
            >
              <Plus /> Add More Treatment
            </Button>
          )}

          <Button
            type="submit"
            className="w-full h-[50px] mt-5 disabled:cursor-not-allowed"
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center gap-1">
                <Spinner />
                {pathName === "/dashboard/treatment-list/add-treatment"
                  ? "Saving..."
                  : "Updating..."}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Save />
                {pathName === "/dashboard/treatment-list/add-treatment"
                  ? "Save"
                  : "Update"}
              </span>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};
