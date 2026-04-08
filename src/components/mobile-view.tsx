import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "./ui/button";
import { BookOpen, Clock, FileText, Star } from "lucide-react";

const MobileView = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-[#0D0D0D] text-white p-7 relative overflow-hidden">
      <div className="max-w-md mx-auto w-full flex flex-col h-full">
        <header className="flex items-center justify-between mb-14">
          <div className="flex items-center gap-2">
            <div className="w-fit">
              <Image
                src="/assets/icon2.svg"
                alt="Clark"
                width={50}
                height={50}
              />
            </div>
            <span className="text-[20px] font-medium font- tracking-tight bebas ">Clark</span>
          </div>

          <Image
            src="/assets/no-mobile.svg"
            alt="No Mobile"
            width={40}
            height={40}
          />
        </header>
        <h1 className="bebas text-[36px]/[auto] font-semibold mb-5">
          <span className="italic font-normal text-white/50">
            This is awkward...
          </span>
          <br />
          we don&apos;t do mobile
          <span className="text-[#FF6B00]">(yet)</span>
        </h1>

        <div className="space-y-4 mb-10">
          <p className="text-[15px] text-white/55 leading-relaxed">
            Clark is built for focused, deep study sessions — and right now that
            experience shines on a larger screen.
          </p>
          <p className="text-[14px] font-medium text-white/80 leading-relaxed">
            Please open Clark on a laptop or desktop for the full experience.
          </p>
        </div>

        <div className="bebas flex items-center gap-3 mb-auto">
          <Button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 bg-[#FF6B00] hover:bg-[#e05e00] transition-colors text-white text-sm font-medium px-5 py-2.5 rounded-lg"
          >
            Back to Home
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </Button>

          <div className="flex gap-2 items-center opacity-30">
            <BookOpen size={15} />
            <Star size={15} />
            <Clock size={15} />
            <FileText size={15} />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-52 pointer-events-none">
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 -rotate-3 w-52 bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />
              <span className="text-[11px] text-white/40">Biology 101</span>
            </div>
            <div className="space-y-1.5">
              <div className="h-1.5 bg-white/10 rounded-full w-4/5" />
              <div className="h-1.5 bg-white/10 rounded-full w-3/5" />
              <div className="h-1.5 bg-white/10 rounded-full w-2/3" />
            </div>
          </div>
          <div className="absolute bottom-20 right-4 rotate-6 w-28 bg-[#FF6B00]/10 border border-[#FF6B00]/25 rounded-xl p-2.5">
            <p className="text-[10px] text-white/40 mb-1.5">Flashcard</p>
            <div className="space-y-1">
              <div className="h-1.5 bg-white/10 rounded-full" />
              <div className="h-1.5 bg-white/10 rounded-full w-3/4" />
            </div>
          </div>
          <div className="absolute bottom-24 left-4 -rotate-6 w-24 bg-white/[0.03] border border-white/10 rounded-xl p-2.5">
            <p className="text-[10px] text-white/35 mb-1">Quiz score</p>
            <p className="text-lg font-semibold text-[#FF6B00]">84%</p>
          </div>
          
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#0D0D0D] to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default MobileView;
