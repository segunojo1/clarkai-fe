"use client";
import { ArrowUp, ChevronRight } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner";
import GetEarlyAccessBtn from "./gea-btn";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger);

const ClarkChat = () => {
  const Reff = useRef(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createTabRef = useRef<HTMLParagraphElement>(null);
  const subHeadingRef = useRef<HTMLHeadingElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const split = new SplitText(headingRef.current, { type: "chars" });

    gsap.fromTo(
      ".spin-decelerate",
      { rotate: 0 },
      {
        rotate: 1000,
        duration: 5,
        ease: "power4.out",
        scrollTrigger: {
          trigger: Reff.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );
    gsap.fromTo(
      split.chars,
      { opacity: 0.15 },
      {
        opacity: 1,
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 70%",
          end: "bottom 80%",
          toggleActions: "play none none reverse",
          markers: false,
        },
      }
    );

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: textareaRef.current,
        start: "top 60%",
        end: "bottom 70%",
        toggleActions: "play none none reverse",
      },
    });

    const textarea = textareaRef.current;
    const createTab = createTabRef.current;
    const textToType = "Teach me Machine Learning in 2 weeks...";

    // reset initial states
    if (textarea) textarea.value = "";
    gsap.set([subHeadingRef.current, paraRef.current], { opacity: 0.15 });
    gsap.set(createTab, { backgroundColor: "#ffffff", color: "#000000" });

    // Sequence
    tl.to({}, { duration: 0.5 })
      
      .to(
        {},
        {
          duration: 2,
          onUpdate: function () {
            const progress = this.progress();
            const chars = Math.floor(progress * textToType.length);
            if (textarea) textarea.value = textToType.slice(0, chars);
          },
          ease: "none",
        },
        0
      )
      .to(
        createTab,
        {
          backgroundColor: "#2C2C2C",
          color: "#ffffff",
          duration: 0.5,
          ease: "power2.out",
        },
        ">-0.3"
      )
      .to(
        [subHeadingRef.current, paraRef.current],
        {
          opacity: 1,
          duration: 1,
          stagger: 0.3,
          ease: "power2.out",
        },
        ">-0.2"
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
        <h2
          ref={headingRef}
          id="texts"
          className="text-[100px] font-normal -tracking-[4px] bebas max-w-[474px] text-[#FAFAFA] text-center"
        >
          Imagine one day you could say:
        </h2>
      </div>

      <div className="py-[50px] px-[80px] text-black flex flex-col items-center bg-[#FAFAFA] gap-[38px]">
        <Chatbot textareaRef={textareaRef} createTabRef={createTabRef} />
        <h3
          ref={subHeadingRef}
          className="text-[66.9px] text-center font-normal -tracking-[2.6px] bebas"
        >
          And Clark builds a full course — with readings, quizzes, flashcards,
          and a progress tracker.
        </h3>
        <p ref={paraRef} className="text-[28px] font-medium">
          Yeah, we&apos;re building that!
        </p>
        <GetEarlyAccessBtn />
      </div>
    </section>
  );
};

export default ClarkChat;

export const Chatbot = ({
  textareaRef,
  createTabRef,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  createTabRef: React.RefObject<HTMLParagraphElement | null>;
}) => {
  const [mode, setMode] = React.useState<"ask" | "research" | "create">("create");

  return (
    <div className="relative max-w-[1240px] w-full bg-white  rounded-[12px] overflow-hidden">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          placeholder="Ask anything… or type @ to see Clark's magic commands..."
          className="min-h-[140px] text-black !border-0 !shadow-none caret-[#ff3d00] text-[16px] font-medium p-3 w-full focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none resize-none relative z-20"
        />

        <div className="flex items-center gap-2 p-2 bg-white dark:bg-[#fff]">
          <Tabs
            value={mode}
            onValueChange={(value) =>
              setMode(value as "ask" | "research" | "create")
            }
            className="flex-1"
          >
            <TabsList className="bg-[#F5F5F5] dark:bg-[#F5F5F5] rounded-[8px] p-0 flex justify-start gap-1 text-[12px]">
              <TabsTrigger
                value="ask"
                className="group p-0 border-none shadow-none flex items-center rounded-md h-full text-sm font-medium text-gray-600 data-[state=active]:text-white data-[state=active]:bg-[#2C2C2C] transition-colors"
              >
                <p className="px-4 py-[7px] rounded-[8.2px] group-data-[state=active]:bg-[#2C2C2C]">
                  Ask
                </p>
              </TabsTrigger>

              <TabsTrigger
                value="research"
                className="group p-0 border-none shadow-none flex items-center rounded-md h-full text-sm font-medium text-gray-600 data-[state=active]:text-white data-[state=active]:bg-[#2C2C2C] transition-colors"
              >
                <p className="px-4 py-[7px] rounded-[8.2px] group-data-[state=active]:bg-[#2C2C2C]">
                  Research
                </p>
              </TabsTrigger>

              <TabsTrigger
                
                value="create"
                className="group bg-white p-0 border-none shadow-none flex items-center gap-[3.5px] rounded-md h-full text-sm font-medium text-gray-600 data-[state=active]:text-white transition-colors"
              >
                <p ref={createTabRef} className=" px-2 py-[7px] rounded-l-[8.2px]">
                  Create
                </p>
                <div className="p-[7px] py-[9px] h-auto rounded-r-[8.2px] bg-transparent group-data-[state=active]:bg-[#2C2C2C] transition-colors">
                  <ChevronRight className="text-white" height={28} width={21} />
                </div>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <div>
              <button
                type="button"
                onClick={() => toast("haha, join Clark to try this out!")}
                className="p-1.5 rounded-full hover:bg-gray-100 "
                aria-label="Attach file"
              >
                <Image
                  src="/assets/file-light.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5 "
                />
              </button>
            </div>

            <>
              {/* <Image
                width={20}
                height={20}
                alt=""
                src="/assets/waveform.svg"
                className="h-5 w-5 dark:block hidden"
              /> */}
              <Image
                width={20}
                height={20}
                alt=""
                src="/assets/waveform-light.svg"
                className="h-5 w-5"
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
