"use client";

import { ArrowDown, ChevronRight } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import GetEarlyAccessBtn from "./gea-btn";

const Hero = () => {
  // const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  // const lastPos = useRef<{ x: number; y: number } | null>(null);

  // useEffect(() => {
  //   const canvas = canvasRef.current;
  //   if (!canvas) return;

  //   const ctx = canvas.getContext("2d");
  //   if (!ctx) return;
  //   ctxRef.current = ctx;

  //   const resizeCanvas = () => {
  //     canvas.width = window.innerWidth;
  //     canvas.height = 1378;
  //     ctx.fillStyle = "#262626"; 
  //     ctx.fillRect(0, 0, canvas.width, canvas.height);
  //   };
  //   resizeCanvas();
  //   window.addEventListener("resize", resizeCanvas);

  //   const draw = (e: MouseEvent) => {
  //     const rect = canvas.getBoundingClientRect();
  //     const x = e.clientX - rect.left;
  //     const y = e.clientY - rect.top;

  //     if (!lastPos.current) {
  //       lastPos.current = { x, y };
  //       return;
  //     }

  //     const ctx = ctxRef.current;
  //     if (!ctx) return;

  //     ctx.strokeStyle = "rgba(255,255,255,0.9)";
  //     ctx.lineWidth = 3;
  //     ctx.lineCap = "round";
  //     ctx.lineJoin = "round";

  //     ctx.beginPath();
  //     ctx.moveTo(lastPos.current.x, lastPos.current.y);
  //     ctx.lineTo(x, y);
  //     ctx.stroke();

  //     lastPos.current = { x, y };
  //   };

  //   const fadeOut = () => {
  //     const ctx = ctxRef.current;
  //     if (!ctx) return;
  //     ctx.fillStyle = "rgba(38,38,38,0.05)";
  //     ctx.fillRect(0, 0, canvas.width, canvas.height);
  //     requestAnimationFrame(fadeOut);
  //   };

  //   fadeOut();
  //   window.addEventListener("mousemove", draw);
  //   window.addEventListener("mouseleave", () => (lastPos.current = null));

  //   return () => {
  //     window.removeEventListener("mousemove", draw);
  //     window.removeEventListener("resize", resizeCanvas);
  //   };
  // }, []);

  return (
    <div className="relative min-h-screen p-8  pb-0 mb-[29px] overflow-hidden bg-[#262626]">
     
      {/* <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      /> */}

      <div className="flex items-center flex-col justify-end gap-[55.5px] h-full mt-[437px] relative z-20">
        <div className="flex w-full h-[172px] justify-between">
          <div className="flex self-end">
            <HeroBox variant="light" rotation={-7.45} top={0} left={0} />
            <HeroBox variant="dark" rotation={0} top={6.86} left={-25} />
            <HeroBox variant="light" rotation={5.96} top={3.35} left={-68.56} />
            <HeroBox variant="dark" rotation={-1.45} top={-1} left={-98} />
          </div>

          <ArrowDown color="#D4D4D4" className="self-center animate-bounce" />

          <div className="flex flex-col gap-6 max-w-[439px] self-start">
            <p className="text-[16px]/normal tracking-[-0.64px] font-medium text-[#FAFAFA]">
              Upload, Create and Organize all your study materials in one clean
              workspace, then let Clark&apos;s{" "}
              <span className="underline">context-aware AI</span>→ do the heavy
              lifting.
            </p>
            <GetEarlyAccessBtn />
          </div>
        </div>

        <h1 className="text-[15vw] tracking-[-0.03em] font-normal bebas text-[#FAFAFA]">
          Learning Made Easy.
        </h1>
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
