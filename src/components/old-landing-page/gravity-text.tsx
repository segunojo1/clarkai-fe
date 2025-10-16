"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function GravityText() {
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Sticky behavior setup
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 40px", // Becomes sticky when reaching 80px from the top
      end: "+=300px", // Ensures it stays sticky longer
      pin: true,
      pinSpacing: false,
    });

    // Falling text animation (tilting all in the same direction)
    itemsRef.current.forEach((el, index) => {
      if (el) {
        gsap.fromTo(
          el,
          { y: -90 * index, opacity: 1, rotate: Math.random() * 40 - 20 }, // Start position
          {
            y: 250 + index * 30, // Falls gradually
            opacity: 0,
            rotate: 28, // **All tilt left (-30 degrees) while falling**
            ease: "power2.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 40px", // Starts falling **only when sticky begins**
              end: "+=1000px", // Falls slowly throughout the scroll
              scrub: 2, // Smooth effect
            },
          }
        );
      }
    });
  }, []);

  return (
    <div className="relative md:flex hidden">
      <div
        ref={containerRef}
        className="sticky top-[80px] flex items-center justify-center w-[280px] h-[104px] bg-[#606060] shadow-[inset_0_-20px_7px_0_rgba(0,0,0,.25)] rounded-[200px] overflow-hidden"
      >
        {["Overwhelming", "Boring", "Scattered", "Endless", "Messy", "Guesswork"].map(
          (text, index) => (
            <div
              key={index}
              ref={(el) => {
                itemsRef.current[index] = el; 
              }}
              className="absolute flex items-center justify-center bg-white text-[23px]/[120%] font-normal font-satoshi p-3 text-black rounded-[40px] shadow-lg"
              style={{
                transform: `rotate(0deg)`,
                top: `${index * 10}px`,
                left: `${index % 2 === 0 ? "20%" : "55%"}`,
              }}
            >
              {text}
            </div>
          )
        )}
      </div>
    </div>
  );
}
