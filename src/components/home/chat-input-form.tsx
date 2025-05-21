"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { chatSchema } from "@/models/validations/chat.validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { ArrowUp, AudioWaveform, Paperclip } from "lucide-react"
import Image from "next/image"



const ChatInputForm = () => {
  const form = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
    defaultValues: {
      chat: "",
    },
  })

  function handleSubmit(values: z.infer<typeof chatSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  const [mode, setMode] = useState("ask")
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 satoshi flex flex-col">
        <FormField
          control={form.control}
          name="chat"
          render={({ field }) => (
            <FormItem>
              <FormControl className=" ">
                {/* <div className=""> */}

                  <div className="relative min-w-[750px] border-[0.3px] border-[#D4D4D4] bg-white dark:bg-[#2C2C2C] rounded-[12px] overflow-hidden">
                    <Textarea
                      placeholder={
                        mode === 'ask'
                          ? "Ask anything… or type @ to see Clark's magic commands..."
                          : mode === 'research'
                            ? "Research a topic..."
                            : "Create something new..."
                      }
                      {...field}
                      className="min-h-[100px] max-h-[180px] text-[16px] max-w-[750px] font-medium p-3 w-full  border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none resize-none"
                    />
                    <div className="flex items-center gap-2 p-2 border-t border-[#D4D4D4] ">
                      <Tabs
                        value={mode}
                        onValueChange={(value) => setMode(value as string)}
                        className="flex-1"
                      >
                        <TabsList className="bg-[#F5F5F5] dark:bg-[#262626] rounded-[8px] p-0 py-5 px-2 h-8 justify-start gap-1">
                          <TabsTrigger
                            value="ask"
                            className="data-[state=active]:bg-white py-4 data-[state=active]:shadow-none rounded-md px-4 h-full text-sm font-medium text-gray-600 data-[state=active]:text-[#FF3D00]"
                          >
                            Ask
                          </TabsTrigger>
                          <TabsTrigger
                            value="research"
                            className="data-[state=active]:bg-white data-[state=active]:shadow-none rounded-md px-4 py-4 h-full text-sm font-medium text-gray-600 data-[state=active]:text-[#FF3D00]"
                          >
                            Research
                          </TabsTrigger>
                          <TabsTrigger
                            value="create"
                            className="data-[state=active]:bg-white data-[state=active]:shadow-none rounded-md px-4 py-4 h-full text-sm font-medium text-gray-600 data-[state=active]:text-[#FF3D00]"
                          >
                            Create
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
                        <AudioWaveform className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
                        <Image src="/assets/at.svg" alt="" width={21} height={30} />
                        <Button
                          type="submit"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-[#FAFAFA] hover:bg-[#FF3D00]/90 "
                        >
                          <ArrowUp className="h-4 w-4 text-[#0A0A0A]" />
                        </Button>
                      </div>
                    </div>
                  </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <div className="relative flex items-center">
          <div className="w-full border-t border-[#D4D4D4]"></div>
        </div> */}
        
      </form>
    </Form>
  )
}

export default ChatInputForm