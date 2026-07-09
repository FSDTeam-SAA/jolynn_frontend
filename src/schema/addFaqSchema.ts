import { z } from "zod";

export const addFaqSchema = z.object({
  question: z.string().min(1, { message: "question is required" }),
  answer: z.string().min(1, { message: "answer is required" }),
});
