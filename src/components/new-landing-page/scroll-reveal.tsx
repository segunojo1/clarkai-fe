"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const ScrollReveal = () => {
  const container = useRef(null);

  useGSAP(
    () => {
      const paragraphs = gsap.utils.toArray<HTMLElement>(".reveal-text");

      //   paragraphs.forEach((para) => {
      const split = new SplitText("#txts", { type: "words" });

      gsap.fromTo(
        ".diamond-icon",
        { opacity: 0, maxWidth: 0, rotate: 0, scale: 0.7, y: 30 },
        {
          opacity: 1,
          maxWidth: 50,
          scale: 1.1,
          rotate: 360,
          y: 0,
          ease: "elastic.out(1, 0.6)",
          duration: 0.5,
          scrollTrigger: {
            trigger: ".diamond-icon",
            start: "top 70%",
            end: "bottom 73%",
            toggleActions: "play none none reverse",
            markers: false,
          },
        }
      );

      gsap.to(".asking", {
        x: 36,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: ".asking",
          start: "top 70%",
          end: "bottom 73%",
          toggleActions: "play none none reverse",
          markers: false,
        },
      });

      gsap.fromTo(
        ".dino, .bulb",
        { opacity: 0, maxWidth: 0, scale: 0.7, y: 30 },
        {
          opacity: 1,
          maxWidth: 50,
          scale: 1.1,
          y: 0,
          ease: "elastic.out(1, 0.6)",
          duration: 0.5,
          scrollTrigger: {
            trigger: ".dino",
            start: "top 70%",
            end: "bottom 73%",
            toggleActions: "play none none reverse",
            markers: false,
          },
        }
      );

      gsap.from(split.words, {
        opacity: 0.15,
        stagger: 0.15,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: container.current,
          start: "top 65%",
          end: "bottom 60%",
          scrub: true,
          markers: false,
        },
      });

      gsap.fromTo(
        ".sense",
        {
          borderBottomWidth: "0%",
          opacity: 0.15,
          y: 30,
        },
        {
          borderBottomWidth: "100%",
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".sense",
            start: "top 65%",
            end: "bottom 60%",
            scrub: true,
            markers: false,
          },
        }
      );

      gsap.fromTo(
        ".star",
        {
          opacity: 0.15,
          scale: 0.7,
        },
        {
          borderBottomWidth: "100%",
          opacity: 1,
          y: 0,
          animation: "spin 1s linear infinite",
          scale: 1.1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".star",
            start: "top 65%",
            end: "bottom 60%",
            scrub: true,
            markers: false,
          },
        }
      );

      gsap.fromTo(
        ".wind",
        {
          opacity: 0.15,
          scale: 0.7,
          y: 30,
        },
        {
          borderBottomWidth: "100%",
          opacity: 1,
          rotate: 360,
          scale: 1.2,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".wind",
            start: "top 65%",
            end: "bottom 60%",
            scrub: true,
            markers: false,
          },
        }
      );
      //   });
    },
    { scope: container }
  );
  return (
    <div ref={container} className="">
      <div
        id="txts"
        className="satoshi text-[33px] md:text-[45px]/normal font-medium flex flex-col text-[#fafafa] text-start  leading-[-1.8px]"
      >
        <span className="reveal-text satoshi flex ">
          When we were kids,
          <Image
            className="diamond-icon brightness-75 transition-all duration-300"
            src="/assets/diamond.svg"
            alt="diamond"
            width={50}
            height={30}
          />{" "}
          learning was magical.
        </span>
        <span className="reveal-text items-center">
          Discovering dinosaurs.{" "}
          <span className="flex items-start relative min-w-[170px] ">
            <Image
              className="dino brightness-75 transition-all duration-300 -left-10 absolute z-[999]"
              src="/assets/dino.svg"
              alt="dino"
              width={86}
              height={86}
            />{" "}
            <span className="asking">Asking </span>
          </span>{" "}
          “why?” a hundred times. Feeling like a genius.
          <span className="relative w-[64px]">
            <Image
              src="/assets/lightbulb.svg"
              className="absolute bulb top-0 -left-4"
              alt="light"
              width={64}
              height={64}
            />
          </span>
        </span>

        <span className="reveal-text">
          Then school made it mechanical: copy notes, memorize, forget, repeat
          repeat repeat repeat repeatrepeatrepeat.
        </span>

        <span className="reveal-text ">
          College made it clear: traditional classes don&apos;t cut it. Real
          understanding comes from deep reading, late-night sessions, and study
          that actually makes{" "}
          <span className="sense flex border-b-[#00FF0D] border-b-[5px] ">
            sense
          </span>
          .
        </span>

        <span className="reveal-text">
          So we built Clark — your personal study sidekick. Upload PDFs, chat
          with AI, make quizzes & flashcards, collaborate with friends, and
          actually enjoy
          <span className="relative">
            <Image
              src="/assets/star.svg"
              className="absolute star animate-spin transition-all duration-300 bottom-2 left-0 mx-auto right-0"
              alt="star"
              width={41}
              height={41}
            />
            learning
          </span>
          again.
        </span>
        <span className="reveal-text">
          Because learning isn&apos;t about sitting in class — it&apos;s about
          mastering knowledge.
        </span>

        <span className="reveal-text items-center ">
          {" "}
          And Clark makes it effortless.
          <span className="relative">
            <Image
              src="/assets/wind.svg"
              className="wind -right-7"
              alt="wind"
              width={55}
              height={55}
            />
          </span>
        </span>
        <span className="reveal-text text-[#5AB864]">
          Built by students, for students.{" "}
        </span>
        <span className="reveal-text"> — Sheriff, Seyi & Segun 💙</span>
      </div>
      
    </div>
  );
};

export default ScrollReveal;
