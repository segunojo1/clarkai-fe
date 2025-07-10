import React from 'react'
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { aboutSchema } from '@/models/validations/auth.validation'
import { z } from 'zod'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PrimaryInput } from '../auth-input'

interface AboutYouProps {
    onSuccess: (data: z.infer<typeof aboutSchema>) => void
}
const AboutYou = ({ onSuccess }: AboutYouProps) => {

    const form = useForm<z.infer<typeof aboutSchema>>({
        resolver: zodResolver(aboutSchema),
        defaultValues: {
            role: "",
            school: "",
            department: "",
            interests: ""
        },
    })

    function onSubmit(values: z.infer<typeof aboutSchema>) {

        console.log(values)
        onSuccess(values)
    }

    return (
        <section className='max-w-[458px] mx-auto flex flex-col items-center '>
            <h1 className='text-[60px] font-semibold text-[#737373]'>Tell us about you.</h1>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 satoshi flex flex-col w-[341px]">
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>Role</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1"
                                    >
                                        <FormItem className={`h-full flex items-center justify-between border transition-all  ${field.value === 'student' ? 'border-orange-500 text-orange-500' : 'border-[#D4D4D4]'} py-[11px] px-4 rounded-[5px] space-y-0`}>
                                            <FormLabel className="font-normal">
                                                Student
                                            </FormLabel>
                                            <FormControl>
                                                <RadioGroupItem value="student" className="text-orange-500 !data-[state=checked]:text-orange-500" />
                                            </FormControl>
                                        </FormItem>
                                        <FormItem className={`flex items-center justify-between border transition-all ${field.value === 'teacher' ? 'text-orange-500 border-orange-500' : 'border-[#D4D4D4]'} py-[11px] px-4 rounded-[5px] space-y-0`}>
                                            <FormLabel className="font-normal">
                                                Teacher
                                            </FormLabel>
                                            <FormControl>
                                                <RadioGroupItem value="teacher" className="text-orange-500 data-[state=checked]:text-orange-500" />
                                            </FormControl>
                                        </FormItem>
                                        <FormItem className={`flex items-center justify-between border transition-all ${field.value === 'other' ? 'text-orange-500 border-orange-500' : 'border-[#D4D4D4]'} py-[11px] px-4 rounded-[5px] space-y-0`}>
                                            <FormLabel className="font-normal">Other</FormLabel>
                                            <FormControl>
                                                <RadioGroupItem value="other" className="text-orange-500 data-[state=checked]:text-orange-500" />
                                            </FormControl>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="relative flex items-center">
                        <div className="w-full border-t border-[#D4D4D4]"></div>
                    </div>
                    <FormField
                        control={form.control}
                        name="school"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-medium ">School</FormLabel>
                                <FormControl>
                                    <PrimaryInput placeholder="Enter School Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-medium">Department</FormLabel>
                                <FormControl>
                                    <PrimaryInput placeholder="E.g Science, Arts, Computer Science" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="interests"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-medium">Interests</FormLabel>
                                <FormControl>
                                    <PrimaryInput placeholder="E.g Science, Arts, Computer Science" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="bg-[#FF3D00] w-full py-[13px] h-full">Continue</Button>
                </form>
            </Form>
        </section>
    )
}

export default AboutYou