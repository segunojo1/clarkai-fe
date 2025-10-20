"use client";
import { ArrowUp } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner";
import GetEarlyAccessBtn from "./gea-btn";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ClarkChat = () => {
  const Reff = useRef(null);
  useEffect(() => {
    gsap.fromTo(
      ".spin-decelerate",
      { rotate: 0 },
      {
        rotate:1000,
        duration: 5,
        ease: "power4.out",
        scrollTrigger: {
          trigger: Reff.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, []);
  return (
    <section
      ref={Reff}
      className="bg-[#262626] flex flex-col items-center px-[20px] py-[50px]"
    >
      <div className="flex flex-col gap-[11px] items-center mb-[38px]">
        <Image
          src="/assets/icon-new.svg"
          alt="Clark Chat"
          width={71}
          height={71}
          className="spin-decelerate"
        />
        <h2 className="text-[100px] font-normal -tracking-[4px] bebas max-w-[474px] text-[#FAFAFA] text-center">
          Imagine one day you could say:
        </h2>
      </div>

      <div className="py-[50px] px-[80px] flex flex-col items-center bg-[#FAFAFA] gap-[38px]">
        <Chatbot />
        <h3 className="text-[66.9px] text-center font-normal -tracking-[2.6px] bebas">
          And Clark builds a full course — with readings, quizzes, flashcards,
          and a progress tracker.
        </h3>
        <p className="text-[28px] font-medium">
          Yeah, we&apos;re building that!
        </p>
        <GetEarlyAccessBtn />
      </div>
    </section>
  );
};

export default ClarkChat;

export const Chatbot = () => {
  const [mode, setMode] = React.useState<"ask" | "research" | "create">("ask");
  return (
    <div className="relative max-w-[1240px] w-full border-[0.3px] bg-white dark:bg-[#2C2C2C] rounded-[12px] overflow-hidden">
      <div className="relative">
        <div className="relative">
          <Textarea
            placeholder="Ask anything… or type @ to see Clark's magic commands..."
            className="min-h-[140px] caret-[#ff3d00] text-[16px] max-w-[750px] font-medium p-3 w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none resize-none relative z-20 text-black dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2 p-2 bg-white dark:bg-[#2c2c2c]">
          <Tabs
            value={mode}
            onValueChange={(value) =>
              setMode(value as "ask" | "research" | "create")
            }
            className="flex-1"
          >
            <TabsList className="bg-[#F5F5F5] dark:bg-[#262626] rounded-[8px] p-0 py-5 px-2 h-8 justify-start gap-1 text-[12px]">
              <TabsTrigger
                value="ask"
                className="data-[state=active]:bg-white border-none data-[state=active]:shadow-none rounded-md h-full text-sm font-medium text-gray-600 data-[state=active]:text-[#FF3D00]"
              >
                <div className="flex items-center px-4 py-4">
                  <span>Ask </span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="research"
                className="data-[state=active]:bg-white border-none data-[state=active]:shadow-none rounded-md px-4 py-4 h-full text-sm font-medium text-gray-600 data-[state=active]:text-[#FF3D00]"
              >
                Research
              </TabsTrigger>
              <TabsTrigger
                value="create"
                className="data-[state=active]:bg-white border-none data-[state=active]:shadow-none rounded-md px-4 py-4 h-full text-sm font-medium text-gray-600 data-[state=active]:text-[#FF3D00]"
              >
                Create
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <div>
              <button
                type="button"
                onClick={() => toast("haha, join Clark to try this out!")}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Attach file"
              >
                <Image
                  src="/assets/file.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5 dark:text-gray-500 text-black hover:text-gray-700 dark:block hidden"
                />
                <Image
                  src="/assets/file-light.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5 dark:text-gray-500 text-black hover:text-gray-700 dark:hidden block"
                />
              </button>
            </div>

            <>
              <Image
                width={20}
                height={20}
                alt=""
                src="/assets/waveform.svg"
                className="h-5 w-5 dark:block hidden"
              />
              <Image
                width={20}
                height={20}
                alt=""
                src="/assets/waveform-light.svg"
                className="h-5 w-5 dark:hidden block"
              />
            </>
            <Button
              type="submit"
              size="icon"
              className="h-8 w-8 rounded-full bg-[#FAFAFA] hover:bg-[#FF3D00]/90"
              aria-label="Send message"
            >
              <ArrowUp className="h-4 w-4 text-[#0A0A0A]" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
