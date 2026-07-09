// schema/doctorSchema.ts
import { z } from "zod";

export const addDoctorSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  image: z.string().optional(),
  cloudinaryId: z.string().optional(),
});

export type DoctorFormData = z.infer<typeof addDoctorSchema>;

export type Doctor = {
  _id: string;
  name: string;
  title: string;
  description: string;
  image?: string;
  cloudinaryId?: string;
  createdAt?: string;
  updatedAt?: string;
};