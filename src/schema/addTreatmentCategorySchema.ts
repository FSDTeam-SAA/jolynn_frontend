// schema/addTreatmentCategorySchema.ts
import { z } from "zod";

export const addTreatmentCategorySchema = z.object({
  name: z.string().min(1, { message: "Treatment category name is required" }),
  image: z.string().min(1, { message: "Treatment category image is required" }),
});

export type AddTreatmentCategoryType = z.infer<typeof addTreatmentCategorySchema>;