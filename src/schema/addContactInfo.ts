// schemas/contactInfoSchema.ts
import { z } from "zod";

export const contactInfoSchema = z.object({
  address: z.string().min(1, { message: "Address is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  openingHours: z.string().min(1, { message: "Opening hours are required" }),
  phoneNumbers: z
    .array(z.string().min(1, { message: "Phone number cannot be empty" }))
    .min(1, { message: "At least one phone number is required" }),
});

export type ContactInfoFormType = z.infer<typeof contactInfoSchema>;
