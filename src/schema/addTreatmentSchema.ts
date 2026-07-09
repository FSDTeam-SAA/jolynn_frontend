// schema/addTreatmentSchema.ts
import { z } from "zod";

export const singleTreatmentSchema = z.object({
  serviceName: z.string().min(1, { message: "Service name is required" }),
  description: z
    .string()
    .min(10, { message: "Description should be at least 10 characters" }),
  image: z
    .instanceof(File)
    .refine((file) => file?.size === 0 || file?.type.startsWith("image/"), {
      message: "Only image files are allowed",
    }),
  category: z.string().min(1, { message: "Category is required" }),
});

export const addTreatmentSchema = z.object({
  treatments: z.array(singleTreatmentSchema),
});