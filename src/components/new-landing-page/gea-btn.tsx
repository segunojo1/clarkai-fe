import React from "react";
import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";

const GetEarlyAccessBtn = () => {
  return (
    <div className="flex items-center gap-[1.5px] group hover:gap-[3px] cursor-pointer transition-all duration-300">
      <Button className="bg-[var(--orange-primary)] dark:text-white group-hover:bg-orange-700 cursor-pointer hover:bg-orange-700 py-[5px] px-[8.5px] rounded-l-[5px] rounded-r-[0px]">
        Get Early Access
      </Button>
      <div className="bg-[var(--orange-primary)] p-[5px] group-hover:bg-orange-700 py-[5.5px] h-auto rounded-r-[5px]">
        <ChevronRight className="text-white" height={25} width={19} />
      </div>
    </div>
  );
};

export default GetEarlyAccessBtn;
