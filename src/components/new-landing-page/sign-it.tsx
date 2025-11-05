"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { ArrowRight, Pencil, RotateCcw, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

const SignIt = () => {
  return (
    <div className="bg-white border-b-[10px] border-b-black">
      <div className="flex items-center w-full justify-between p-[100px] pb-[38px]">
        <h2 className="text-[70px]/[90px] bebas text-black font-normal -tracking-[3.2px]">
          Sign it!
        </h2>
        <Image src="/assets/icon3.svg" alt="Sign it" width={71} height={71} />
      </div>

      <SignCanvas />
      <Footer />
    </div>
  );
};

export default SignIt;

export const SignCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEditable, setIsEditable] = useState(true);
  const [strokes, setStrokes] = useState<Array<ImageData>>([]);
  const [savedImage, setSavedImage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [baseImage, setBaseImage] = useState<ImageData | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth * 0.9;
    canvas.height = 644;

    const context = canvas.getContext("2d");
    if (context) {
      context.lineWidth = 3;
      context.lineCap = "round";
      context.strokeStyle = "#000";
      setCtx(context);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!ctx || !canvas) {
      console.log("ctx not found yet");
      return;
    }

    const fetchAndDrawSignatures = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/sign");
        const data = await res.json();

        if (data?.data?.length > 0) {
          const images = data.data as Array<{ image: string }>;
          // Load all images, then draw them in order
          await Promise.all(
            images.map(
              (signature) =>
                new Promise<void>((resolve) => {
                  const img = new window.Image();
                  img.crossOrigin = "anonymous";
                  img.onload = () => {
                    if (ctx && canvasRef.current) {
                      ctx.drawImage(img, 0, 0);
                    }
                    resolve();
                  };
                  img.onerror = () => resolve();
                  img.src = signature.image;
                })
            )
          );
        } else {
          // No existing signatures; ensure canvas is cleared
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // Capture the base snapshot (preloaded signatures only)
        const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setBaseImage(snapshot);

        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error("Error loading signatures:", error);
      }
    };

    fetchAndDrawSignatures();
  }, [ctx]);

  const getCoordinates = (e: any) => {
    if (e.touches) {
      const rect = e.target.getBoundingClientRect();
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top,
      };
    } else {
      return { offsetX: e.nativeEvent.offsetX, offsetY: e.nativeEvent.offsetY };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditable || !ctx) return;
    const { offsetX, offsetY } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditable || !isDrawing || !ctx) return;
    const { offsetX, offsetY } = getCoordinates(e);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!ctx || !canvasRef.current) return;
    if (isDrawing) {
      setStrokes((prev) => [
        ...prev,
        ctx.getImageData(
          0,
          0,
          canvasRef.current!.width,
          canvasRef.current!.height
        ),
      ]);
    }
    ctx.closePath();
    setIsDrawing(false);
  };
  const undoLast = () => {
    if (isSaved) return;
    if (!ctx || !canvasRef.current) return;
    if (strokes.length === 0) {
      // Revert to base image if available
      if (baseImage) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.putImageData(baseImage, 0, 0);
      }
      return;
    }

    const newStrokes = [...strokes];
    newStrokes.pop();
    setStrokes(newStrokes);

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    if (newStrokes.length > 0) {
      ctx.putImageData(newStrokes[newStrokes.length - 1], 0, 0);
    } else if (baseImage) {
      ctx.putImageData(baseImage, 0, 0);
    }
  };

  const toggleEdit = () => {
    setIsEditable((prev) => !prev);
  };

  const saveCanvas = async () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");

    setSavedImage(dataUrl);
    setIsSaved(true);

    try {
      await fetch("/api/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });

      toast("Welcome mate! youve joined Clarks Hall Of Fame");

      const img = new window.Image();
      img.src = dataUrl;
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
      };
    } catch (err) {
      console.error("Error saving:", err);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center my-10">
      {/* Canvas Container */}
      <div className="relative border-2 ">
        <canvas
          ref={canvasRef}
          className={`bg-[#FAFAFA] rounded-xl ${
            isEditable ? "cursor-crosshair" : "cursor-not-allowed opacity-70"
          }`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        ></canvas>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-xl">
            <span className="animate-pulse text-gray-500 text-sm">
              Loading signatures...
            </span>
          </div>
        )}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 px-4 py-2 rounded-full ">
          <button
            onClick={undoLast}
            className="p-5 hover:bg-[#F0F0EF] rounded-md transition-colors"
            title="Undo Last Stroke"
          >
            <RotateCcw color="black" size={22} className="rotate-[-25.13deg]" />
          </button>

          <button
            onClick={toggleEdit}
            className={`p-5 rounded-md -translate-y-1/2 transition-colors ${
              isEditable ? "bg-[#313131] text-white" : " text-gray-700"
            }`}
            title="Toggle Edit Mode"
          >
            <Pencil size={16} />
          </button>

          <button
            onClick={saveCanvas}
            className="p-5 hover:bg-[#F0F0EF] rounded-md transition-colors"
            title="Save"
          >
            <ThumbsUp color="black" size={22} className="rotate-[25.13deg]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const Footer = () => {
  return (
    <div className="flex p-[100px] justify-between items-center">
      <div className="flex flex-col items-start gap-5">
        <h3 className="text-[18.8px] text-black font-bold -tracking-[0.7px]">
          Subscribe to the Clark Newsletter
        </h3>
        <p className="text-[12.3px] font-normal text-[#262626] -tracking-[0.4px]">
          Latest news, events, announcements and updates direct to your inbox.
        </p>
        <div className="relative">
          <Input
            placeholder="Enter your email"
            className="py-[8px] w-[294px] h-full px-[30px] pr-[54px] bg-black dark:bg-black text-[#A3A3A3] rounded-[20px]"
          />
          <ArrowRight
            color="#fff"
            width={24}
            height={17}
            className="cursor-pointer absolute top-0 bottom-0 right-[30px] my-auto"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-8 text-[12px]/[19px] font-medium text-[#000]/80">
        <ul>
          <li>Back story</li>
          <li>Features</li>
          <li>News</li>
        </ul>

        <ul>
          <li>About</li>
          <li>Terms</li>
          <li>Privacy</li>
        </ul>

        <ul>
          <li>Support</li>
          <li>Futures</li>
          <li>Careers</li>
          <li>Newsletter</li>
        </ul>

        <ul>
          <li>Instagram</li>
          <li>Twitter</li>
          <li>LinkedIn</li>
        </ul>
      </div>
    </div>
  );
};
