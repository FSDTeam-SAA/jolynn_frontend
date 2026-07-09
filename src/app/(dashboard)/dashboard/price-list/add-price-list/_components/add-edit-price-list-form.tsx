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
import { addPriceListSchema } from "@/schema/addPriceListSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import z from "zod";
import { RichTextEditor } from "../../../_component/shared/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Save, Plus, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type formType = z.input<typeof addPriceListSchema>;

type PriceItem = {
  _id: string;
  serviceName: string;
  items: {
    description: string;
    rate: number;
  }[];
  currency: string;
};

interface Props {
  priceListDetails?: PriceItem;
  id?: string;
}

const AddEditPriceListForm = ({ priceListDetails, id }: Props) => {
  const queryClient = useQueryClient();
  const pathName = usePathname();
  const router = useRouter();
  const session = useSession();
  const token = (session?.data?.user as { token: string })?.token;

  const form = useForm<formType>({
    resolver: zodResolver(addPriceListSchema),
    defaultValues: {
      serviceName: "",
      items: [{ description: "", rate: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    if (
      pathName !== "/dashboard/price-list/add-price-list" &&
      priceListDetails
    ) {
      form.reset({
        serviceName: priceListDetails?.serviceName || "",
        items: priceListDetails?.items?.map((item) => ({
          description: item.description || "",
          rate: item.rate?.toString() || "",
        })) || [{ description: "", rate: "" }],
      });
    }
  }, [pathName, priceListDetails, form]);

  const { mutateAsync, isPending } = useMutation<any, any, formType>({
    mutationKey: ["add-price-list"],
    mutationFn: async (data) => {
      const isAdd = pathName === "/dashboard/price-list/add-price-list";
      const method = isAdd ? "POST" : "PUT";
      const url = isAdd
        ? `${process.env.NEXT_PUBLIC_API_URL}/treatmentfees`
        : `${process.env.NEXT_PUBLIC_API_URL}/treatmentfees/${id}`;

      // Convert rate from string to number for backend
      const requestData = {
        ...data,
        items: data.items.map((item) => ({
          ...item,
          rate: parseFloat(item.rate) || 0,
        })),
      };

      const res = await fetch(url, {
        method,
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      return res.json();
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["all-price-list"] });
      toast.success(data.message);
      router.push('/dashboard/price-list')
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

  const addNewItem = () => {
    append({ description: "", rate: "" });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast.error("At least one item is required");
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Service Name field */}
          <FormField
            control={form.control}
            name="serviceName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    placeholder="Enter service name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Items Array */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1>Price Items</h1>
              <Button
                type="button"
                onClick={addNewItem}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  <Button
                    type="button"
                    onClick={() => removeItem(index)}
                    variant="destructive"
                    size="sm"
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Description Field */}
                <FormField
                  control={form.control}
                  name={`items.${index}.description`}
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

                {/* Rate Field - Now as string */}
                <FormField
                  control={form.control}
                  name={`items.${index}.rate`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate (EUR)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          placeholder="Enter rate"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
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

export default AddEditPriceListForm;
