import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { Button } from "../ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { toast } from "sonner";

interface VerifyEmailProps {
    email: string;
    onSuccess: () => void
}
const FormSchema = z.object({
    pin: z.string().min(6, {
        message: "Your one-time password must be 6 characters.",
    }),
})

const VerifyEmail = ({ email, onSuccess }: VerifyEmailProps) => {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            pin: "",
        },
    })

    function onSubmit(data: z.infer<typeof FormSchema>) {
        toast("You submitted the following values:")
        onSuccess()
    }
    return (
        <section>
            <h2 className="text-[29px]/[auto] text-[#737373] font-semibold mb-6">Verify your email</h2>
            <p className="text-[15px] font-medium mb-[30px]">
                We've sent an OTP message to <span className="text-[#FF3D00]">{email}</span>. Enter it to activate your Clark account and start learning.
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
                                            <InputOTPSlot index={4} />
                                            <InputOTPSlot index={5} />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit">Submit</Button>
                </form>
            </Form>
            <div className="relative flex items-center my-8">
                    <div className="w-full border-t border-[#D4D4D4]"></div>
                </div>
            <div className="mt-8 flex flex-col gap-3">
                <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 p-4  border-[#D4D4D4] rounded-[5px] border-[1px] h-[52px] text-[16px] font-normal"
                    type="button"
                >

                    Resend link
                </Button>
                <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 p-4  border-[#D4D4D4] rounded-[5px] border-[1px] h-[52px] text-[16px] font-normal"
                    type="button"
                >
                    Change email
                </Button>
            </div>
        </section>
    );
};

export default VerifyEmail;