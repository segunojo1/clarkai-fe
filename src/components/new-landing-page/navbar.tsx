import { ArrowRight, ArrowRightIcon, ChevronRight, Globe } from "lucide-react";
import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import GetEarlyAccessBtn from "./gea-btn";

const Navbar = () => {
  return (
    <nav className="flex items-center z-[999999999] justify-between fixed w-full px-6 py-4">
      <div className="flex items-center">
        <img src="/assets/orange.png" alt="Logo" className="h-8 w-8 " />
        <div className="w-[1px] h-[25px] bg-[#A3A3A3] mx-3" />
        <div className="flex items-center space-x-2">
          <Globe className="h-5 w-5" color="#A3A3A3" />
          <select className="bg-transparent  focus:outline-none focus:border-primary text-[#A3A3A3]">
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </div>

      <div className="border border-[#404040] bg-[#262626] flex items-center p-1 rounded-[9px]">
        <GetEarlyAccessBtn />

        <div className="md:flex hidden">
          <ul className="flex items-center gap-[3px] text-white tracking-[-0.72px]">
            <li className="gap-[10px] flex items-center p-[5px] px-3">
              <div className="w-[18px] h-[18px] rounded-[4.5px] bg-[#404040]"></div>
              <Link href="#story">Story</Link>
            </li>
            <li className="gap-[10px] flex items-center p-[5px] px-3">
              <div className="w-[18px] h-[18px] rounded-[4.5px] bg-[#404040]"></div>
              <Link href="#features">Features</Link>
            </li>
            <li className="gap-[10px] flex items-center p-[5px] px-3">
              <div className="w-[18px] h-[18px] rounded-[4.5px] bg-[#404040]"></div>
              <Link href="#pricing">Pricing</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="w-[18px] h-[18px] rounded-[4.5px] bg-[#404040]"></div>
    </nav>
  );
};

export default Navbar;
