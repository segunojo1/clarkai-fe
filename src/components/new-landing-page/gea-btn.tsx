"use client";

import React, { useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";

interface GetEarlyAccessBtnProps {
  magnetic?: boolean;
  force?: number;
  innerForce?: number;
}

const GetEarlyAccessBtn: React.FC<GetEarlyAccessBtnProps> = ({
  magnetic = false,
  force = 0.3,
  innerForce = 0.15,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!magnetic || !wrapperRef.current || !innerRef.current) return;

    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    const text = textRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);

      inner.style.transition = "transform 0.1s ease-out";
      inner.style.transform = `translate(${x * force}px, ${y * force}px)`;

      if (text) {
        text.style.transition = "transform 0.15s ease-out";
        text.style.transform = `translate(${x * innerForce}px, ${y * innerForce}px)`;
      }
    };

    const handleMouseLeave = () => {
      inner.style.transition = "transform 0.6s cubic-bezier(0.19, 1, 0.22, 1)";
      inner.style.transform = "translate(0, 0)";
      if (text) {
        text.style.transition = "transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)";
        text.style.transform = "translate(0, 0)";
      }
    };

    wrapper.addEventListener("mousemove", handleMouseMove);
    wrapper.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      wrapper.removeEventListener("mousemove", handleMouseMove);
      wrapper.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [magnetic, force, innerForce]);

  return (
    <div
      ref={wrapperRef}
      className="relative inline-block cursor-pointer select-none"
    >
      <div
        ref={innerRef}
        className={`flex items-center gap-[1.5px] group hover:gap-[3px] transition-all duration-300 ${magnetic && "border-[1.25px] rounded-[5px] border-white"}`}
      >
        <Button className="bg-[var(--orange-primary)] dark:text-white group-hover:bg-orange-700 hover:bg-orange-700 py-[5px] px-[8.5px] rounded-l-[5px] rounded-r-[0px] relative overflow-hidden">
          <span ref={textRef} className="block relative z-10">
            Get Early Access
          </span>
        </Button>
        <div className="bg-[var(--orange-primary)] p-[5px] group-hover:bg-orange-700 py-[5.5px] h-auto rounded-r-[5px]">
          <ChevronRight className="text-white" height={25} width={19} />
        </div>
      </div>
    </div>
  );
};

export default GetEarlyAccessBtn;
