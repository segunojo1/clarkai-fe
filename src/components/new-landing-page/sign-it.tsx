import Image from "next/image";
import React from "react";
import { Input } from "../ui/input";
import { ArrowRight } from "lucide-react";

const SignIt = () => {
  return (
    <div className="bg-white">
      <div className="flex items-center w-full justify-between p-[100px] pb-[38px]">
        <h2 className="text-[70px]/[90px] bebas font-normal -tracking-[3.2px]">
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
  return <div>SignCanvas</div>;
};

export const Footer = () => {
  return (
    <div className="flex p-[100px] justify-between items-center">
      <div className="flex flex-col items-start gap-5">
        <h3 className="text-[18.8px] font-bold -tracking-[0.7px]">
          Subscribe to the Clark Newsletter
        </h3>
        <p className="text-[12.3px] font-normal text-[#262626] -tracking-[0.4px]">
          Latest news, events, announcements and updates direct to your inbox.
        </p>
        <div className="relative">
          <Input
            placeholder="Enter your email"
            className="py-[8px] h-full px-[30px] bg-black text-[#A3A3A3] rounded-[20px]"
          />
          <ArrowRight className="absolute top-0 bottom-0 right-[30px] my-auto" />
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
