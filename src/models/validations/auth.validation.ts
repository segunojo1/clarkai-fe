import { RollerCoaster } from "lucide-react";
import * as z from "zod"

export const signupSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  nickName: z.string().min(2, {
    message: "Nickname must be at least 2 characters."
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  confirmPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().default(false).optional(),
})

export const aboutSchema = z.object({
  role: z.string().email('Please enter a valid role'),
  school: z.string().min(8, 'Please enter school'),
  department: z.string(),
  interests: z.string()
})

export interface AboutFormValues {
  role: string;
  school: string;
  department: string;
  interests: string;
}

export interface SignupFormValues {
  fullName: string;
  email: string;
  nickName: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe?: boolean;
} 
