// auth/reset/page.tsx
"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import AuthClientLayout from "@/components/layout/auth-layout"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { PrimaryInput } from "@/components/auth-input"
import { Button } from "@/components/ui/button"
import authService from "@/services/auth.service"
import Link from "next/link"

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

const ResetPasswordPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    if (!token) {
      toast.error("Missing or invalid reset token. Please use the link from your email.")
      return
    }
    try {
      setIsSubmitting(true)
      await authService.resetPassword({ token, password: values.password })
      toast.success("Your password has been reset. You can now log in.")
      router.push("/auth/login")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to reset password"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthClientLayout>
      <div>
        <h2 className="text-[29px]/[auto] text-[#737373] font-semibold mb-[22px]">Reset your password</h2>
        <p className="text-sm text-[#737373] mb-6">Enter a new password for your account.</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 satoshi flex flex-col">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">New password</FormLabel>
                  <FormControl>
                    <PrimaryInput type="password" placeholder="Enter new password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Confirm new password</FormLabel>
                  <FormControl>
                    <PrimaryInput type="password" placeholder="Re-enter new password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="bg-[#FF3D00] w-full py-[13px] h-full" disabled={isSubmitting}>
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>

            <div className="text-center">
              <Link href="/auth/login" className="text-[#FF3D00] text-sm hover:underline">
                Return to login
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </AuthClientLayout>
  )
}

export default ResetPasswordPage
