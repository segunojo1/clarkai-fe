'use client'
import { useState } from 'react';
import Image from "next/image";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Slide = {
  id: number;
  title: string;
  description: string;
  image: string;
  buttonText: string;
};

const slides: Slide[] = [
  {
    id: 1,
    title: "Talk to your materials. Get instant clarity.",
    description: "Upload any file and Clark responds like a savvy study buddy—breaking down everything from slides to 200‑page PDFs with clear, instant answers.",
    image: "/assets/step-1.png",
    buttonText: "Continue"
  },
  {
    id: 2,
    title: "Turn PDFs into smart, editable materials.",
    description: "Clark helps you summarize entire chapters, highlight key points, or even edit and rebuild your materials with fresh updates—based on new uploads, class notes, or AI-generated insights.",
    image: "/assets/step-2.png",
    buttonText: "Next"
  },
  {
    id: 3,
    title: "All your study files, perfectly organized.",
    description: "Studying isnt linear. Clark gives you Boards to organize materials, themes, or semesters—with drag-and-drop flow, visibility controls, and smart linking between files.",
    image: "/assets/step-3.png",
    buttonText: "Next"
  },
  {
    id: 4,
    title: "Group study, redefined.",
    description: "No more messy group chats. Jump into a shared infinite whiteboard, brainstorm ideas, explain concepts to others, or drop visual summaries directly from chat.",
    image: "/assets/step-4.png",
    buttonText: "Next"
  },
  {
    id: 5,
    title: "Accountability, minus the stress.",
    description: "Keep track of your learning with streaks, reminders, and progress check-ins. Clark nudges you to stay consistent and celebrates the little wins that build big knowledge.",
    image: "/assets/step-5.png",
    buttonText: "Get Started"
  }
];

interface OnboardingModalProps {
  onClose: () => void;
}

const OnboardingModal = ({ onClose }: OnboardingModalProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = slides[currentSlide];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <section 
      className="z-[99999] fixed inset-0 flex items-center justify-center bg-[#fafafaa8]"
      onClick={(e) => {
        // Close modal when clicking outside the content
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <section className={`p-[10px] flex ${currentSlide > 1 && currentSlide < 4 ? 'bg-[#F5F5F5]' : 'bg-[#191919]'}  rounded-[20px] max-w-[1010px] h-[620px]`}>
        {/* Left side - Content */}
        <div className="py-[10px] px-5 max-w-[497px] flex flex-col">
          <h1 className={`text-[45px]/[auto]  ${currentSlide > 1 && currentSlide < 4 ? 'text-black' : 'text-white'}  font-semibold  mb-[15px]`}>
            {slide.title}
          </h1>
          <p className={` text-[16px] ${currentSlide > 1 && currentSlide < 4 ? 'text-[#525252]' : 'text-[#D4D4D4]'} font-normal mb-[41px] flex-grow`}>
            {slide.description}
          </p>
          <div className="mb-[18px]">
            <Image
              draggable={false}
              src={slide.image}
              alt={`Step ${slide.id}`}
              width={457}
              height={264}
              className="w-full h-auto"
            />
          </div>
          <Button
            onClick={nextSlide}
            className="bg-[#FF3D00] w-full py-[13px] h-[45px] hover:bg-[#e63900] transition-colors"
          >
            {slide.buttonText}
          </Button>
          


        </div>

        {/* Right side - Preview */}
        <div className={`w-[483px] h-[600px]   ${currentSlide > 1 && currentSlide < 4 ? 'bg-[#262626]' : 'bg-white'} rounded-[10px] relative`}>
         
          {currentSlide > 0 && (
            <button
              onClick={prevSlide}
              className=" bg-[#D4D4D4] hover:text-[#D4D4D4] text-black mt-[10px] mx-[10px] px-[10px] py-[2px] rounded-[4px] z-10 hover:bg-black/70 transition-colors"
              aria-label="Previous slide"
            >
              Prev
            </button>
          )}
          {currentSlide < slides.length - 1 && (
            <button
              onClick={nextSlide}
              className="bg-[#D4D4D4] hover:text-[#D4D4D4] text-black mt-[10px] px-[10px] ml-[10px] py-[2px] rounded-[4px] z-10 hover:bg-black/70 transition-colors"
              aria-label="Next slide"
            >
              Next
            </button>
          )}
<button 
            onClick={onClose}
            className="text-[#A3A3A3] hover:text-[#FF3D00] mt-4 text-sm transition-colors absolute bottom-[10px] left-[10px]"
          >
            Skip for now
          </button>
          <div className="flex justify-center absolute bottom-[10px] right-[10px] space-x-2">
            {slides.map((_, index) => (
              <p
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-colors text-[24px] font-medium cursor-pointer satoshi ${
                  currentSlide === index ? 'text-[#FF3D00]' : 'text-[#A3A3A3]'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              >{index + 1}</p>
            ))}
          </div>

        </div>
      </section>
    </section>
  );
};

export default OnboardingModal;