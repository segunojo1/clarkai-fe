
import * as z from "zod"

export const signupSchema = z.object({
  name: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  nickname: z.string().min(2, {
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
  role: z.string().min(2, 'Please select role'),
  school: z.string().min(2, 'Please enter school'),
  department: z.string(),
  interests: z.string()
})

export const studyVibeOptions = [
  'Ace my next exam',
  'Stay organized',
  'Learn new topics faster',
  'Collaborate with classmates',
  'Master a difficult subject',
  'Build better study habits'
] as const;

export type StudyVibeOption = typeof studyVibeOptions[number];

export const studyVibeSchema = z.object({
  study_vibe: z.array(z.string()).min(1, 'Please select at least one option')
})

export interface AboutFormValues {
  role: string;
  school: string;
  department: string;
  interests: string;
}

export interface SignupFormValues {
  name: string;
  email: string;
  nickname: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe?: boolean;
} 
