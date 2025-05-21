import { z } from "zod";

export const chatSchema = z.object({
  chat: z.string().min(2, 'Please enter a valid message')
})

export interface ChatFormValues {
    chat: string;
  } 
  