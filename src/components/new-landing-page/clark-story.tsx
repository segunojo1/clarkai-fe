"use client";
import React from "react";
import ScrollReveal from "./scroll-reveal";
import Image from "next/image";
import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";
import GetEarlyAccessBtn from "./gea-btn";

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
      <GetEarlyAccessBtn />
    </div>
  );
};

export default ClarkStory;
