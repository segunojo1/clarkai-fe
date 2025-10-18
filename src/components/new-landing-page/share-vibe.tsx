import Image from "next/image";
import React from "react";

const ShareVibe = () => {
  return (
    <div className="bg-black flex flex-col gap-[38px] items-center p-[100px]">
      <div className="flex items-center w-full justify-between">
        <h2 className="text-[147px] bebas text-white font-normal -tracking-[5.9px]">
          Share THE VIBE
        </h2>
        <Image
          src="/assets/icon2.svg"
          alt="Share THE VIBE"
          width={71}
          height={71}
        />
      </div>
      <ShareCard />
    </div>
  );
};

export default ShareVibe;

export const ShareCard = () => {
  return (
    <div className="bg-white -rotate-[7.26deg] p-[13px] flex flex-col gap-[10px] max-w-[450px] rounded-[21px]">
      <p className="text-[18px] font-bold text-[#737373] -tracking-[0.72px]">
        Send study vibes, create your Clark support card, and share it with the
        world. Don&apos;t forget to tag @ClarkAI_ so we can repost you!
      </p>
      <div>
        <Image
          src="/assets/share-card.png"
          alt="Share THE VIBE"
          width={424}
          height={502}
        />
      </div>
    </div>
  );
};
