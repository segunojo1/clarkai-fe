"use client";

import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown } from "lucide-react";
import Image from "next/image";
import React, { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
const ClarkFeatures = () => {
  useEffect(() => {
    const images = gsap.utils.toArray<HTMLImageElement>("[data-speed]");

    images.forEach((img) => {
      const speed = parseFloat(img.dataset.speed || "0.5");

      gsap.to(img, {
        yPercent: speed * -30,
        ease: "none",
        scrollTrigger: {
          trigger: img.parentElement,
          start: "top center",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <section className="bg-white py-[100px] ">
      <div className=" max-w-[1240px] mx-auto">
        <div className="flex justify-between mb-[50px] items-center">
          <ArrowDown color="black" width={36} height={45} strokeWidth={6.3} />
          <h2 className="text-[40px] font-normal text-black tracking-[-1.6px] bebas max-w-[213px]">
            Everything you need in One place.
          </h2>
        </div>

        <div className="grid w-full grid-cols-4 auto-rows-[150px] gap-3 p-4">
          <div className="col-span-4 flex justify-end  row-span-3 overflow-hidden relative group">
            <div className="absolute inset-0 bg-[#262626] opacity-0 group-hover:opacity-50 transition-opacity duration-300 z-[2]" />
            <Image
              src="/assets/bento1.png"
              alt="bento1"
              width={800}
      height={1240}
              data-speed="0.6"
              className="object-cover w-full min-h-[601px] will-change-transform "
            />
            <div className="z-[9999] max-w-[447px] text-[#FAFAFA] absolute bottom-[40px] right-[40px]  text-right ">
              <h3 className="text-[25px] font-bold">Organized Workspaces</h3>
              <p className="text-[18px] font-medium">
                Ceate a workspace for every subject or project. Keep your notes,
                quizzes, flashcards, and chats neatly organized so nothing ever
                gets lost.
              </p>
            </div>
          </div>

          <div className="col-span-2 row-span-3 flex items-start justify-start overflow-hidden relative group">
            <div className="absolute inset-0 bg-[#262626] opacity-0 group-hover:opacity-50 transition-opacity duration-300 z-[2]" />
            <Image
              src="/assets/bento2.png"
              alt="bento2"
              width={612}
      height={800}
              data-speed="1.5"
              className=" object-contain min-h-[800px] w-full will-change-transform "
            />
            <div className="z-[9999] max-w-[447px] mix-blend-difference absolute bottom-[40px] left-[40px] text-left text-[#FAFAFA] ">
              <h3 className="text-[25px] font-bold">
                Your Study Materials, Supercharged
              </h3>
              <p className="text-[18px] font-medium">
                Upload lecture slides, pictures, textbooks, or any PDF.
                Highlight key sections, ask Clark questions, and get clear,
                personalized answers right inside the document.
              </p>
            </div>
          </div>

          <div className="col-span-2 row-span-2 overflow-hidden flex justify-end relative group">
            <div className="absolute inset-0 bg-[#262626] opacity-0 group-hover:opacity-50 transition-opacity duration-300 z-[2]" />

            <Image
              src="/assets/bento3.png"
              alt="bento3"
              width={611}
              height={500}
              data-speed="1.2"
              className="object-contain min-h-[500px] w-full will-change-transform "
            />
            <div className="z-[9999] max-w-[447px] text-[#FAFAFA] absolute  bottom-[40px] right-[40px] text-right ">
              <h3 className="text-[25px] font-bold">
                Quizzes you actually learn from
              </h3>
              <p className="text-[18px] font-medium">
                Turn your notes into quizzes that help you retain knowledge,
                track progress, and keep your learning streak alive —
                effortlessly.
              </p>
            </div>
          </div>

          <div className="col-span-2 row-span-1 overflow-hidden flex justify-end p-10 relative group">
            <div className="absolute inset-0 bg-[#262626] opacity-0 group-hover:opacity-50 transition-opacity duration-300 z-[2]" />

            <Image
              src="/assets/bento4.png"
              alt="bento4"
              fill
              data-speed="0.8"
              className="object-contain !scale-[1.4] will-change-transform "
            />
            <div className="z-[9999] max-w-[447px] text-[#FAFAFA] relative self-end justify-self-end text-right ">
              <h3 className="text-[25px] font-bold">
                Answers that fit your context
              </h3>
              <p className="text-[18px] font-medium">
                Whether it&apos;s your own PDFs or the entire web, Clark tailors
                every response to the source you choose.
              </p>
            </div>
          </div>

          <div className="col-span-2 row-span-5 overflow-hidden flex justify-end relative group">
            <div className="absolute inset-0 bg-[#262626] opacity-0 group-hover:opacity-50 transition-opacity duration-300 z-[2]" />
            <Image
              src="/assets/bento5.png"
              alt="bento5"
              width={614}
              height={1034}
              data-speed="0.5"
              className="object-contain w-full min-h-[1034px] will-change-transform"
            />
            <div className="z-[9999] max-w-[447px] text-[#FAFAFA] absolute  bottom-[40px] right-[40px] text-right ">
              <h3 className="text-[25px] font-bold">Flashcards Made for You</h3>
              <p className="text-[18px] font-medium">
                Generate and share flashcards in seconds from your own
                materials. Review smarter, memorize faster, and retain what
                actually matters.
              </p>
            </div>
          </div>
          <div className="col-span-2 flex items-end row-span-3">
            <h2 className="text-[40px] text-black font-normal max-w-[213px] tracking-[-1.6px] bebas">
              Keep track of your Progress.
            </h2>
          </div>
          <div className="col-span-2 row-span-2 overflow-hidden relative group">
            <Image
              src="/assets/bento6.png"
              alt="bento6"
              fill
              data-speed="1.2"
              className="object-cover !scale-[1.3] will-change-transform "
            />
          </div>

          <div className="col-span-2 flex items-end row-span-1 overflow-hidden relative group">
            <h2 className="text-[40px] font-normal text-black tracking-[-1.6px] bebas">
              DO MORE WITH A CHATBOT
            </h2>
          </div>

          <div className="col-span-4 row-span-3 overflow-hidden relative flex justify-end  group">
            <div className="absolute inset-0 bg-[#262626] opacity-0 group-hover:opacity-50 transition-opacity duration-300 z-[2]" />
            <Image
              src="/assets/bento7.png"
              alt="bento7"
              width={1240}
              height={600}
              data-speed="0.9"
              className="object-contain w-full min-h-[600px] will-change-transform"
            />
            <div className="z-[9999] max-w-[447px] text-[#FAFAFA] absolute  bottom-[40px] right-[40px] text-right ">
              <h3 className="text-[25px] font-bold">Context Aware Chatbot</h3>
              <p className="text-[18px] font-medium">
                Generate and share flashcards in seconds from your own
                materials. Review smarter, memorize faster, and retain what
                actually matters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClarkFeatures;
