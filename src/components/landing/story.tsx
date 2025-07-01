"use client";

import { motion } from "motion/react";
import { useEffect, useState, useRef } from "react";

export default function AnimatedContent() {
  const contentBlocks = [
    {
      text: "We’ve always been known as the \"PDFers\" - The ones who barely show up to class, skim through lecture slides, and still pass with flying colors.",
      image1: { src: "/assets/file.svg", position: "top-[-18px] left-[53%] w-30 h-30" },
      highlight: "colors.",
      initialColor: "#F24E06",
    },
    {
      text: "Not because we hate learning, but because we’ve figured out how to learn smarter.",
      image1: { src: "/assets/spark.svg", position: "md:top-[35px] top-[54px] md:left-[19%] left-[20%] md:w-[39px] w-[20px] h-[20px] md:h-[25px]" },
    },
    {
      text: "Then we got to college. And suddenly, it was clear—traditional classes just don’t cut it. Real understanding comes from deep reading, late-night cramming, and group study sessions that actually make sense.",
      image1: { src: "/assets/mdi_sleep.svg", position: "top-[75px] left-[7%] animate-pulse w-30 h-30" },
    },
    {
      text: "That’s why we built",
      image1: { src: "/assets/clark_icon.svg", position: "md:top-[-35px] top-[-15px] md:w-[90px] w-[60px] h-[49px] md:h-[79px] right-[-54px] md:right-[-76px]" },
    },
    {
      text: "A study sidekick that helps you learn faster and smarter. Upload PDFs, chat with AI, collaborate on an infinite whiteboard, and track your progress--all in one place.",
      image1: { src: "/assets/upload-01.svg", position: "top-[0px] right-0 w-[24px] h-[24px]" },
      image2: { src: "/assets/pointers.svg", position: "md:top-[37px] top-[50px] right-[30%] md:w-[123px] w-[103px] md:h-[52px] h-[44px] animate-pulse" },
    },
    {
      text: "Because learning isnt about sitting in a class. Its about understanding, mastering and owning knowledge. And clark makes it effortless",
      image1: { src: "/assets/clark_icon2.svg", position: "bottom-[7px] md:right-[37%] left-0 md:block hidden md:left-auto md:w-[64px] w-[44px] h-[56px]" },
    },
    {
      text: "Built by students, for students.",
      image1: { src: "/assets/clark_icon3.svg", position: "md:bottom-[0px] bottom-[5px] md:right-[-90px] md:w-[100px] w-[50px] right-[-40px] block" },
      extratext: " — Sheriff, Seyi & Segun from "
    },
  ];

  const [activeIndex, setActiveIndex] = useState(-1);
  const refs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      let newActiveIndex = activeIndex;

      refs.current.forEach((el, index) => {
        if (el) {
          const rect = el.getBoundingClientRect();
          const distanceFromBottom = windowHeight - rect.top;

          if (distanceFromBottom >= windowHeight / 2) {
            newActiveIndex = index;
          } else if (distanceFromBottom < windowHeight / 2 && activeIndex === index) {
            newActiveIndex = index - 1;
          }
        }
      });
      
      setActiveIndex(newActiveIndex);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeIndex]);

  return (
    <div id="story" className="flex flex-col items-start gap-12 font-anec md:max-w-[827px] max-w-[350px] mt-[45px] relative">
      {contentBlocks.map((block, index) => {
        const highlightWords = block.highlight || "";
        const restOfText = block.text.replace(highlightWords, "");
        const extraText = block.extratext;

        return (
          <motion.div
          key={index}
          ref={(el) => {
            refs.current[index] = el; // Assign, but do not return
          }}
          className="relative md:text-[27.5px] text-[20px] font-medium transition-all"
        >
            <motion.span
              initial={{ color: block.initialColor || "#00000074" }}
              animate={index <= activeIndex ? { color: "#000000" } : { color: block.initialColor || "#00000074" }}
              transition={{ duration: 0.4 }}
              className="relative z-10"
            >
              <div>
              <span style={{ color: index <= activeIndex ? "#000000" : "#00000074" }}>
                {restOfText}
              </span>
              <br />
                <p>{extraText}</p>
              </div>
              {highlightWords && <span style={{ color: "#F24E06" }}>{highlightWords}</span>}
            </motion.span>

            {[block.image1, block.image2].map((image, i) =>
              image ? (
                <motion.img
                  key={i}
                  src={image.src}
                  alt="Animated Image"
                  className={`absolute z-[99999]  ${image.position} object-cover`}
                  initial={{ opacity: 0.8, scale: 0.8 }}
                  animate={index <= activeIndex ? { opacity: 1, scale: 1 } : { opacity: 0.8, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                />
              ) : null
            )}
          </motion.div>
        );
      })}
    </div>
  );
}