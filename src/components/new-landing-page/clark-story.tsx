"use client";
import React from "react";
import ScrollReveal from "./scroll-reveal";
import Image from "next/image";
import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";

const ClarkStory = () => {
  return (
    <div className="max-w-[1073px] pb-[100px] mx-auto flex items-center gap-6 flex-col">
      <ScrollReveal />
      <Image
        src="/assets/magic-btn.svg"
        className="self-end"
        alt="btn"
        width={50}
        height={50}
      />
      <div className="flex items-center gap-[1.5px] group hover:gap-[3px] cursor-pointer transition-all duration-300">
        <Button className="bg-[var(--orange-primary)] group-hover:bg-orange-700 cursor-pointer hover:bg-orange-700 py-[5px] px-[8.5px] rounded-l-[5px] rounded-r-[0px]">
          Get Early Access
        </Button>
        <div className="bg-[var(--orange-primary)] p-[5px] group-hover:bg-orange-700 py-[5.5px] h-auto rounded-r-[5px]">
          <ChevronRight className="text-white" height={25} width={19} />
        </div>
      </div>
    </div>
  );
};

export default ClarkStory;
