import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";

const AnimatedText = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const shapesRef = useRef<(HTMLDivElement | null)[]>([]);
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const handleMouseMove = (evt: MouseEvent) => {
      const { clientX: x, clientY: y } = evt;
      
      gsap.to(cursorRef.current, {
        x, y: y - 130,
        ease: "power2.out",
      });

      gsap.to(shapesRef.current, {
        x: x - 670, y: y - 100,
        stagger: -0.1,
        ease: "power3.out",
      });
    };

    document.body.addEventListener("mousemove", handleMouseMove);
    return () => document.body.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative w-screen h-[110px] md:flex hidden overflow-hidden bg-[#2E302F]">
      {/* Cursor */}
      <div
        ref={cursorRef}
        className="fixed w-5 h-5 bg-[#000000] rounded-full pointer-events-none z-50"
      />
      
      {/* Shapes */}
      <div className="absolute inset-0 flex justify-center items-center">
        {["#000000", "#ffe5e3", "#F14E07"].map((color, index) => (
          <div
            key={index}
            ref={(el) => {
              shapesRef.current[index] = el;
            }}
            className="absolute rounded-full"
            style={{
              backgroundColor: color,
              width: [650, 440, 270][index],
              height: [650, 440, 270][index],
              margin: `-${[650, 440, 270][index] / 2}px 0 0 -${[650, 440, 270][index] / 2}px`,
            }}
          />
        ))}
      </div>

      {/* Animated Text */}
      <div className="absolute inset-0 flex items-center justify-center mix-blend-screen bg-[#F8F8F8]">
        <h1
          ref={textRef}
          className="font-american md:text-[80px]/[120%] text-[35px] font-semibold text-[#2E302F] text-center md:text-start"
        >
          <span className="relative mr-3">
            Education
            <Image
              src="/assets/line4.svg"
              alt=""
              width={405}
              height={1}
              draggable={false}
              className="absolute bottom-[-4px] right-0 left-0"
            />
          </span>
          Reinvented
        </h1>
      </div>
    </div>
  );
};

export default AnimatedText;