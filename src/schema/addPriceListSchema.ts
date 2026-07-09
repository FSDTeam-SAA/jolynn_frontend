import { z } from "zod";

export const priceListItemSchema = z.object({
  description: z.string().min(1, { message: "Description is required" }),
  rate: z.string().min(1, { message: "Rate is required" }),
});

export const addPriceListSchema = z.object({
  serviceName: z.string().min(1, { message: "Service name is required" }),
  items: z.array(priceListItemSchema).min(1, { message: "At least one item is required" }),
});