import React from "react";
import GetEarlyAccessBtn from "./gea-btn";
import Marquee from "./marquee";

const ClarkBottomBanner = () => {
  return (
    <div className="bg-[#FF3D00] relative overflow-hidden">
      <div className="absolute inset-0 flex justify-center items-center z-10">
          <GetEarlyAccessBtn magnetic force={0.5} />
      </div>

      <Marquee>
        <div className="whitespace-nowrap ">
          <h2 className="inline-block text-[646px]/none bebas font-normal -tracking-[25px] text-white opacity-100">
            CLARK
          </h2>
        </div>
      </Marquee>
    </div>
  );
};

export default ClarkBottomBanner;
