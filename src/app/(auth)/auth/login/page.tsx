// auth/login/page.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { PrimaryInput } from "@/components/auth-input"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { loginSchema } from "@/models/validations/auth.validation"
import { z } from "zod"
import { toast } from "sonner"
import authService from "@/services/auth.service"
import { useEffect, useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import AuthClientLayout from "@/components/layout/auth-layout"
import { useUserStore } from "@/store/user.store"
import { useRouter } from "next/navigation"
import { handleGoogleSignIn, handleGoogleLogout } from "@/utils/google"
import { useSession } from "next-auth/react"
import Cookies from "js-cookie"
import useAuthStore from "@/store/auth.store"

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const route = useRouter()
  const { data: session, status } = useSession()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Handle session changes and redirect appropriately
  useEffect(() => {
    const handleSessionChange = async () => {
      if (status === "authenticated" && session) {
        try {
          setIsGoogleLoading(true)
          
          // Check if this is a Google OAuth session with backend token
          // Use a locally-typed user to access custom fields added via NextAuth callbacks
          const oauthUser = session.user as (typeof session.user & {
            backendAccessToken?: string
            isOnboardingNeeded?: boolean
          })

          if (oauthUser?.backendAccessToken) {
            // Store the backend token in cookies
            Cookies.set("token", oauthUser.backendAccessToken, { 
              expires: 7, 
              sameSite: "lax", 
              secure: process.env.NODE_ENV === "production" 
            })

            Cookies.set('user',  JSON.stringify(oauthUser), {
              expires: 7, 
              sameSite: "lax", 
              secure: process.env.NODE_ENV === "production" 
            });
          
            
            // Check if user needs to complete onboarding
            if (oauthUser?.isOnboardingNeeded) {
              sessionStorage.setItem("is_oauth_signup", "true")
              useAuthStore.getState().updateSignupData({ 
                currentStep: 3,
                name: oauthUser.name || "",
                email: oauthUser.email || "",
                nickname: oauthUser.name || ""
              })
              route.push("/auth/signup")
            } else {
              // Existing user - get user data from session and update store
              try {
                const userData = oauthUser as any
                if (userData) {
                  useUserStore.getState().setUser(userData)
                }
                
                // Redirect to home
                route.push("/home")
              } catch (error) {
                console.error("Error getting user data:", error)
                toast.error("Failed to fetch user information")
                await handleGoogleLogout()
              }
            }
          }
        } catch (error) {
          console.error("Session handling error:", error)
          toast.error("Authentication error")
          await handleGoogleLogout()
        } finally {
          setIsGoogleLoading(false)
        }
      }
    }

    handleSessionChange()
  }, [session, status, route])

  const handleSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true)

      const { user, token } = await authService.login({
        email: values.email, 
        password: values.password
      })

      // Store token in cookies
      Cookies.set("token", token, { 
        expires: 7, 
        sameSite: "lax", 
        secure: process.env.NODE_ENV === "production" 
      })

      // Update user in the store
      useUserStore.getState().setUser(user)
      route.push('/home')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true)
      await handleGoogleSignIn()
    } catch (error) {
      console.error("Google login error:", error)
      toast.error("Failed to sign in with Google")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  // Show a full-screen loading state during OAuth callback or while session is resolving
  if (isGoogleLoading || status === 'authenticated' || status === 'loading') {
    return (
      <AuthClientLayout>
        <div className="min-h-[60vh] md:min-h-[70vh] flex flex-col items-center justify-center gap-4">
          <svg className="animate-spin h-6 w-6 text-[#FF3D00]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <p className="text-sm text-[#737373]">Signing you in and setting things up...</p>
        </div>
      </AuthClientLayout>
    )
  }

  return (
    <AuthClientLayout>
      <div>
        <h2 className="text-[29px]/[auto] text-[#737373] font-semibold mb-[22px]">Welcome Back to Clark!</h2>
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
            <div className="relative flex items-center">
              <div className="w-full border-t border-[#D4D4D4]"></div>
            </div>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 p-4 border-[#D4D4D4] rounded-[5px] border-[1px] h-[52px] text-[16px] font-normal"
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                "Processing..."
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            <Link href="/auth/signup" className="text-[#FF3D00] text-base justify-self-end self-end mb-4">
              Dont have an account? Sign up
            </Link>
            <Button
              type="submit"
              className="bg-[#FF3D00] w-full py-[13px] h-full"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </Form>
        <button onClick={handleGoogleLogout} className="mt-4 text-sm text-gray-500">
          Debug: Sign out
        </button>
      </div>
    </AuthClientLayout>
  )
}

export default LoginForm