import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { Button } from "../ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { toast } from "sonner";
import { useEffect, useState } from 'react';
import authService from '@/services/auth.service';
import useAuthStore from '@/store/auth.store';

interface VerifyEmailProps {
    email: string;
    otpSentAt?: number;
    onSuccess: () => void
}
const RESEND_COOLDOWN_SECONDS = 30;
const FormSchema = z.object({
    pin: z.string().min(4, {
        message: "Your one-time password must be 4 characters.",
    }),
})

const VerifyEmail = ({ email, otpSentAt, onSuccess }: VerifyEmailProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const updateSignupData = useAuthStore(state => state.updateSignupData);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            pin: "",
        },
    });

    useEffect(() => {
        if (!otpSentAt) {
            setResendCooldown(0);
            return;
        }

        const elapsedSeconds = Math.floor((Date.now() - otpSentAt) / 1000);
        const initialRemaining = Math.max(RESEND_COOLDOWN_SECONDS - elapsedSeconds, 0);
        setResendCooldown(initialRemaining);

        if (initialRemaining === 0) {
            return;
        }

        const timer = window.setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    window.clearInterval(timer);
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => window.clearInterval(timer);
    }, [otpSentAt]);

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;

        try {
            setIsLoading(true);
            const userData = useAuthStore.getState().signupData as { name?: string };
            await authService.sendOtp(email, userData.name || '');
            toast.success('OTP resent successfully');

            const now = Date.now();
            setResendCooldown(RESEND_COOLDOWN_SECONDS);
            updateSignupData({ otpSentAt: now });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to resend OTP'
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        try {
            setIsLoading(true);
            await authService.verifyOtp(email, data.pin);

            // Update signup data with verified status
            updateSignupData({
                emailVerified: true,
                otp: data.pin
            });

            toast.success('Email verified successfully');
            onSuccess();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to verify OTP'
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <section>
            <h2 className="text-[29px]/[auto] text-[#737373] font-semibold mb-6">Verify your email</h2>
            <p className="text-[15px] font-medium mb-[30px]">
                We&apos;ve sent an OTP message to <span className="text-[#FF3D00]">{email}</span>. Enter it to activate your Clark account and start learning.
            </p>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-6">
                    <FormField
                        control={form.control}
                        name="pin"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <InputOTP pattern={REGEXP_ONLY_DIGITS} maxLength={6} {...field}>
                                        <InputOTPGroup className="w-full">
                                            <InputOTPSlot index={0} />
                                            <InputOTPSlot index={1} />
                                            <InputOTPSlot index={2} />
                                            <InputOTPSlot index={3} />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full bg-[#FF3D00]"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Verifying...' : 'Verify Email'}
                    </Button>
                </form>
            </Form>
            <div className="relative flex items-center my-8">
                <div className="w-full border-t border-[#D4D4D4]"></div>
            </div>
            <div className="mt-8 flex flex-col gap-3">
                <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 p-4 border-[#D4D4D4] rounded-[5px] border-[1px] h-[52px] text-[16px] font-normal"
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading || resendCooldown > 0}
                >
                    {isLoading ? 'Sending...' : resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
             </Button>
                {/* <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 p-4  border-[#D4D4D4] rounded-[5px] border-[1px] h-[52px] text-[16px] font-normal"
                    type="button"
                >
                    Change email
                </Button> */}
            </div>
        </section>
    );
};

export default VerifyEmail;