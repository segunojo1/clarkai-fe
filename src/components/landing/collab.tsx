"use client";

import { motion } from "motion/react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import Link from "next/link";

const Collab = () => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    if (isHovered) {
      window.addEventListener("mousemove", moveCursor);
    } else {
      window.removeEventListener("mousemove", moveCursor);
    }

    return () => window.removeEventListener("mousemove", moveCursor);
  }, [isHovered]);

  return (
    <section
      className="mt-[124px] relative px-3 md:px-0 font-satoshi flex flex-col items-center bg-[url('/assets/landing/bg.png')] bg-contain cursor-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header Icons */}
      <div className="flex justify-between w-full items-center px-[29px] pt-[30px]">
        <Image src="/assets/landing/clarkbtn.svg" alt="" width={40} height={44} draggable={false} />
        <Image src="/assets/landing/plusmore.svg" alt="" width={51} height={19} draggable={false} />
      </div>

      {/* Main Heading */}
      <div className="md:text-[60px]/[120%] text-[30px] font-semibold font-american flex flex-col items-center text-black">
        <h2>Study Together,</h2>
        <div className="flex">
          <span className="relative">
            Anytime
            <Image src="/assets/landing/line1.svg" alt="" width={255} height={3} className="absolute bottom-1 right-0 left-0" draggable={false} />
          </span>
          ,{" "}
          <span className="relative">
            Anywhere.
            <Image src="/assets/landing/line2.svg" alt="" width={304} height={1} className="absolute bottom-1 right-0 left-0" draggable={false} />
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-[20px]/[120%] font-medium text-[#606060] mt-[27px] md:text-start text-center">
        Collaborate in real-time with friends with an infinite whiteboard, sticky notes, timers, and more.
      </p>

      {/* Card Section */}
      <div className="flex flex-col md:flex-row md:mt-[104px] mt-[50px] md:gap-[103px] gap-[50px] md:pb-48 pb-28">
        {/* Left Card */}
        <div className="relative mt-[90px]">
          <Image src="/assets/landing/cardd4.svg" alt="" width={324} height={387} draggable={false} />
          <Image src="/assets/landing/sherrif_cursor.svg" alt="" width={80} height={43} className="absolute z-[9999] top-7 right-28" draggable={false} />
          <Image src="/assets/landing/segun_cursor.svg" alt="" width={80} height={43} className="absolute z-[9999] top-36 right-12" draggable={false} />
        </div>

        {/* Draggable Middle Card */}
        <motion.div transition={{ ease: "easeOut", type: "spring", duration: 0.3, damping: 90 }}
          className="z-[9999999]"
          drag
          dragTransition={{ power: 0.1 }}>
          <Image src="/assets/landing/cardd3.svg" alt="" width={324} height={387} draggable={false} />
        </motion.div>

        {/* Right Card */}
        <div className="relative mt-[90px]">
          <Image src="/assets/landing/cardd5.svg" alt="" width={324} height={387} draggable={false} />
          <Image src="/assets/landing/hasbiy_cursor.svg" alt="" width={80} height={43} className="absolute z-[9999] top-7 right-28" draggable={false} />
        </div>
      </div>

      {/* Shadow Effect */}
      <Image src="/assets/landing/shadow2.svg" alt="" width={1924} height={603} className="absolute left-0 -bottom-1 right-0 z-[99]" draggable={false} />

      {/* Join Button */}
      <Link href='/auth/signup' className="py-2 px-4 text-[13px]/[120%] bg-[#F14E07] text-white rounded-[23px] flex items-center gap-2 mx-auto z-[9999] relative">
        Join Clark Now
        <Image src="/assets/landing/clarkbtn.svg" alt="clark btn" width={16} height={17} />
      </Link>

      {/* Custom Cursor */}
      {isHovered && (
        <div
          className="fixed pointer-events-none z-[999999999]"
          style={{
            left: cursorPosition.x,
            top: cursorPosition.y,
            transform: "translate(-50%, -50%)",
          }}
        >
                  <Image src="/assets/landing/orange-cursor.svg" alt="cursor" width={80} height={43} />


          
        </div>
      )}
    </section>
  );
};

export default Collab;
