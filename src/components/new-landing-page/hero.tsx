import { ArrowDown, ChevronRight } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

const Hero = () => {
  return (
    <div className="h-screen p-8 pb-0 mb-[29px]">
      <div className="flex items-center flex-col justify-end gap-[55.5px] h-full">
        <div className="flex w-full h-[172px] justify-between ">
          <div className="flex self-end ">
            <HeroBox variant="light" rotation={-7.45} top={0} left={0} />
            <HeroBox variant="dark" rotation={0} top={6.86} left={-25} />
            <HeroBox variant="light" rotation={5.96} top={3.35} left={-68.56} />
            <HeroBox variant="dark" rotation={-1.45} top={-1} left={-98} />
          </div>

          <ArrowDown color="#D4D4D4" className="self-center animate-bounce"/>

          <div className="flex flex-col gap-6 max-w-[439px] self-start">
            <p className="text-[16px]/normal tracking-[-0.64px] font-medium text-[#FAFAFA]">
              Upload, Create and Organize all your study materials in one clean
              workspace, then let Clark&apos;s{" "}
              <span className="underline">context-aware AI</span>→ do the heavy
              lifting.
            </p>
            <div className="flex items-center gap-[1.5px] group hover:gap-[3px] cursor-pointer transition-all duration-300">
              <Button className="bg-[var(--orange-primary)] group-hover:bg-orange-700 cursor-pointer hover:bg-orange-700 py-[5px] px-[8.5px] rounded-l-[5px] rounded-r-[0px]">
                Get Early Access
              </Button>
              <div className="bg-[var(--orange-primary)] p-[5px] group-hover:bg-orange-700 py-[5.5px] h-auto rounded-r-[5px]">
                <ChevronRight className="text-white" height={25} width={19} />
              </div>
            </div>
          </div>
        </div>

        <h1 className="text-[15vw] tracking-[-0.03em] font-normal bebas text-[#FAFAFA]">Learning Made Easy.</h1>
      </div>
    </div>
  );
};

export default Hero;

export const HeroBox = ({
  variant,
  rotation,
  top,
  left,
}: {
  variant: string;
  rotation: number;
  top: number;
  left: number;
}) => {
  return (
    <div
      style={{
        transform: `rotate(${rotation}deg) translateY(${top}px) translateX(${left}px)`,
      }}
      className={`w-[113px] h-[124px] ${
        variant === "dark" ? "bg-[#404040]" : "bg-[#D4D4D4]"
      } rotate-[${rotation}deg] rounded-[12.4px]`}
    ></div>
  );
};
