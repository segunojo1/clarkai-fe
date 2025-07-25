"use client"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { PrimaryInput } from "@/components/auth-input"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { signupSchema } from "@/models/validations/auth.validation"
import { z } from "zod"
import { toast } from "sonner"
import authService from "@/services/auth.service"
import { useState, useEffect } from "react"
import useAuthStore from "@/store/auth.store"
import Link from "next/link"
import { handleGoogleSignup } from "@/utils/google"
import { useSession } from "next-auth/react"

interface SignUpFormProps {
  form: UseFormReturn<z.infer<typeof signupSchema>>
  onSubmit: (values: z.infer<typeof signupSchema>) => void
  onSuccess?: (email: string) => void
}

const SignUpForm = ({ form, onSubmit }: SignUpFormProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const updateSignupData = useAuthStore((state) => state.updateSignupData)

  const { data: session, status } = useSession();
console.log(session, status);

  // Check if this is an OAuth signup when component mounts
  useEffect(() => {
    const isOauthSignup = sessionStorage.getItem("is_oauth_signup") === "true";
    if (isOauthSignup) {
      // Wait for session to be loaded
      const checkSession = () => {
        if (status === "authenticated" && session?.user) {
          // Set current step to 3 since we skip steps 1 and 2 with Google sign-in
          updateSignupData({ 
            currentStep: 3, 
            name: session.user.name || "", 
            email: session.user.email || "", 
            nickname: session.user.name || ""
          });
        } else if (status === "loading") {
          setTimeout(checkSession, 100);
        } else {
          updateSignupData({ currentStep: 3, name: "", email: "", nickname: "" });
        }
      };
      checkSession();
    }
  }, [updateSignupData, status, session]);

  const handleSubmit = async (values: z.infer<typeof signupSchema>) => {
    try {
      setIsLoading(true)
      // Save initial signup data to store
      updateSignupData({
        ...values,
        emailVerified: false
      })
      await authService.sendOtp(values.email, values.name)
      updateSignupData({
        ...values,
        currentStep: 1,
      })
      onSubmit(values)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  


  return (
    <div>
      <h2 className="text-[29px]/[auto] text-[#737373] font-semibold mb-[22px]">Create your Clark account</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 satoshi flex flex-col">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Enter your email.</FormLabel>
                <FormControl>
                  <PrimaryInput placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Enter your full name.</FormLabel>
                <FormControl>
                  <PrimaryInput placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nickname"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">What should we call you?</FormLabel>
                <FormControl>
                  <PrimaryInput placeholder="Enter your nickname" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Create a strong password.</FormLabel>
                <FormControl>
                  <PrimaryInput type="password" placeholder="Enter your password" {...field} />
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
                <FormLabel className="font-medium">Confirm Password</FormLabel>
                <FormControl>
                  <PrimaryInput type="password" placeholder="Confirm your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="relative flex items-center">
            <div className="w-full border-t border-[#D4D4D4]"></div>
          </div>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 p-4 border-[#D4D4D4] rounded-[5px] border-[1px] h-[52px] text-[16px] font-normal"
            type="button"
            onClick={() => handleGoogleSignup()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
            </svg>
            Continue with Google
          </Button>
          <Link href="/auth/login" className="text-[#FF3D00] text-base justify-self-end self-end mb-4">
            Already have an account? Log in
          </Link>
          <Button
            type="submit"
            className="bg-[#FF3D00] w-full py-[13px] h-full"
            disabled={isLoading}
          >
            {isLoading ? 'Sending OTP...' : 'Continue'}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default SignUpForm
