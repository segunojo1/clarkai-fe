
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
import { z } from "zod"
import { studyVibeSchema, studyVibeOptions } from "@/models/validations/auth.validation"
import { Checkbox } from "../ui/checkbox"

interface StudyVibeProps {
    onSuccess: (data: z.infer<typeof studyVibeSchema>) => void
}
const StudyVibe = ({ onSuccess }: StudyVibeProps) => {

    const form = useForm<z.infer<typeof studyVibeSchema>>({
        resolver: zodResolver(studyVibeSchema),
        defaultValues: {
            study_vibe: [],
        },
    })

    function onSubmit(values: z.infer<typeof studyVibeSchema>) {
        console.log('Selected study vibes:', values.study_vibe);
        onSuccess(values);
    }

    return (
        <section className="">
            <h1 className='text-[60px] font-semibold text-[#737373] mb-[49px]'>What&apos;s your study vibe?</h1>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 satoshi flex flex-col max-w-[341px] mx-auto">
                    <FormField
                        control={form.control}
                        name="study_vibe"
                        render={() => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-base">Role</FormLabel>
                                <div className="space-y-4">
                                    {studyVibeOptions.map((option) => (
                                        <FormField
                                            key={option}
                                            control={form.control}
                                            name="study_vibe"
                                            render={({ field }) => {
                                                return (
                                                    <FormItem
                                                        key={option}
                                                        className={`flex items-center justify-between border transition-all ${field.value?.includes(option)
                                                            ? 'border-orange-500 text-orange-500'
                                                            : 'border-[#D4D4D4]'
                                                            } py-3 px-4 rounded-[5px] space-y-0`}
                                                    >
                                                        <FormLabel className="font-normal cursor-pointer flex-1">
                                                            {option}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(option)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...field.value || [], option])
                                                                        : field.onChange(
                                                                            field.value?.filter(
                                                                                (value: string) => value !== option
                                                                            )
                                                                        )
                                                                }}
                                                                className="text-orange-500 !data-[state=checked]:text-orange-500"
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )
                                            }}
                                        />
                                    ))}
                                </div>
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

export default StudyVibe