"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { ArrowRight, Pencil, RotateCcw, RotateCw, Save, ThumbsUp } from "lucide-react";

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

  // Start drawing
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditable || !ctx) return;
    const { offsetX, offsetY } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  // Draw continuously
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditable || !isDrawing || !ctx) return;
    const { offsetX, offsetY } = getCoordinates(e);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  // Stop drawing and save stroke
  const stopDrawing = () => {
    if (!ctx || !canvasRef.current) return;
    if (isDrawing) {
      setStrokes((prev) => [...prev, ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height)]);
    }
    ctx.closePath();
    setIsDrawing(false);
  };

  // Undo last stroke
  const undoLast = () => {
    if (isSaved) return;
    if (!ctx || !canvasRef.current || strokes.length === 0) return;
    const newStrokes = [...strokes];
    newStrokes.pop();
    setStrokes(newStrokes);

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    if (newStrokes.length > 0) {
      ctx.putImageData(newStrokes[newStrokes.length - 1], 0, 0);
    }
  };

  // Toggle edit mode
  const toggleEdit = () => {
    setIsEditable((prev) => !prev);
  };

  // Save signature
  const saveCanvas = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    setSavedImage(dataUrl);
    setIsSaved(true);
  };

  return (
    <div className="relative flex flex-col items-center justify-center my-10">
      {/* Canvas Container */}
      <div className="relative border-2 ">
        <canvas
          ref={canvasRef}
          className={`bg-[#FAFAFA] rounded-xl ${isEditable ? "cursor-crosshair" : "cursor-not-allowed opacity-70"}`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        ></canvas>

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
            <ThumbsUp color="black" size={22} className="rotate-[25.13deg]"/>
          </button>
        </div>
      </div>

      {/* Saved Image */}
      {/* {savedImage && (
        <div className="mt-6">
          <p className="mb-2 text-gray-600">Saved Signature:</p>
          <img
            src={savedImage}
            alt="Saved signature"
            className="border rounded-md shadow-sm w-[400px]"
          />
        </div>
      )} */}
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
          <ArrowRight color="#fff" width={24} height={17} className="cursor-pointer absolute top-0 bottom-0 right-[30px] my-auto" />
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
