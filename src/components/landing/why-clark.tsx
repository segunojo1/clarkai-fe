'use client'
import Image from 'next/image'
import React from 'react'
import AnimatedStoryContent from './story'
import { Button } from './ui/button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTrigger,
} from "@/components/ui/dialog"
import Link from 'next/link'
import { Typewriter } from 'react-simple-typewriter'



const WhyClark = () => {
    return (
        <div id='story' className='flex flex-col items-center px-3 md:px-0'>
            <div className='flex flex-col gap-[10px] items-center mt-5'>
                <Image draggable={false} src='/assets/whyclark.png' alt='why clark' width={216} height={26} />
                <p className='md:text-2xl/[auto] text-[22px] font-bold font-satoshi text-center md:text-start'>We Needed a Better Way to Study...📚</p>
            </div>
            <AnimatedStoryContent />
            <div className='flex md:flex-row flex-col gap-2 font-satoshi items-center justify-between w-full max-w-[827px] mt-[50px]'>
                <Link href='/waitlist' className='py-2 px-4 md:w-[175px] text-[13px]/[120%] bg-[#F14E07] text-white rounded-[23px] flex items-center gap-2'>
                    Join the Waitlist
                    <Image src='/assets/clarkbtn.svg' alt='clark btn' width={16} height={17} />
                </Link>
                <div className='flex items-center gap-[10px] justify-center md:justify-end w-full md:max-w-full max-w-[350px]'>
                    <p className='text-[18px]/[120%] font-medium'>Too much to read? Let’s </p>
                    <Dialog>
                        <DialogTrigger>
                            <Button className='py-2 px-4 bg-black rounded-[23px] text-white text-[13px]/[120%] font-medium'>Summarize</Button>
                        </DialogTrigger>
                        <DialogContent className='z-[99999999999] max-w-[500px] p-0 !rounded-[39px]'>
                            <DialogHeader>
                                <div className='relative  !rounded-[39px]'>
                                    <DialogClose asChild className='absolute top-[24px] right-[35px]'>
                                        <Button type="button" variant="secondary" className='w-[84px] h-[38px] text-[17px] py-[7px] px-[15px] text-[17px]/[auto] font-satoshi bg-white'>
                                            Done
                                        </Button>
                                    </DialogClose>
                                    <Image src='/assets/modal-bg.png' alt='header' width={500} height={332} />
                                </div>
                                <div className='p-[20px]'>
                                    <div className='bg-[#F0F0F0] md:py-[27px] py-[18px] md:px-[21px] px-[16px] rounded-[41px] md:text-[17px]/[auto] text-[14px] text-[#6B6B6B] font-satoshi flex flex-col items-start  gap-5'>
                                        <Typewriter
                                            words={["When we got to college, we realized traditional classes don't cut it—real learning happens through personalized study and collaboration. So we built Clark, your AI-powered study sidekick for effortless learning, collaboration, and progress tracking."]}
                                            loop={1}
                                            typeSpeed={30}
                                            deleteSpeed={50}
                                            delaySpeed={1000}
                                        />
                                        <p className='font-bold'>We hope you enjoy using it!</p>
                                        <DialogClose asChild>
                                            <Button type="button" variant="secondary" className='w-fit text-[17px] bg-white'>
                                                Done
                                            </Button>
                                        </DialogClose>

                                    </div>
                                </div>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>

                    <Image src='/assets/summarize.svg' alt='summarize' width={18} height={18} className='md:block hidden animate-spin' />
                </div>
            </div>
        </div>
    )
}

export default WhyClark