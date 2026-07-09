import { z } from "zod";

// Helper function to check if value is a File
const isFile = (value: unknown): value is File => {
  return value instanceof File;
};

export const addGallerySchema = z.object({
  before: z.object({
    imageFile: z.unknown()
      .refine((value) => isFile(value) && value.size > 0, {
        message: "Before image is required",
      })
  }),
  after: z.object({
    imageFile: z.unknown()
      .refine((value) => isFile(value) && value.size > 0, {
        message: "After image is required",
      })
  }),
});

export type AddGalleryFormType = z.infer<typeof addGallerySchema>;