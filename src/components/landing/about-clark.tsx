'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import React from 'react'

const AboutClark = () => {

  return (
    <section className='max-w-[800px] mx-auto mt-[115px] font-satoshi px-3 md:px-0'>
      <h2 className='md:text-[53px]/[120%] text-[30px] text-center md:text-start font-semibold font-american '><span className='relative'>Everything <Image src='/assets/line4.svg' alt='' width={284} height={1} draggable={false} className='absolute bottom-[-4px] right-0 left-0' /></span> you’ve ever needed to ace your studies—and more.</h2>
      <div className='text-[17px]/[120%] mt-[25px] text-center md:text-start '>ClarkAi brings all your study tools together—AI assistance, quizzes, whiteboards, and progress tracking—so you can learn faster and smarter, without the hassle.</div>

      <div id='features' className='flex flex-col md:flex-row md:gap-[59px] gap-[20px] items-center  rounded-[20px] h-full border mt-[29px]'>
        <div className='flex flex-col justify-between min-h-full h-[390px] md:pl-14 px-6  pt-3 md:pb-[38px] pb-[20px]'>
          <h3 className='text-[32px]/[120%] font-bold'>Your AI Study Buddy. Always <span className='relative'>     Ready      <Image src='/assets/line3.svg' alt='' width={84} height={2} draggable={false} className='absolute bottom-[-4px] right-0 left-0' />
          </span>.</h3>
          <p className='text-[20px]/[120%]'>Get instant answers, study tips, and recommendations—whenever you need them.</p>
        </div>
        <motion.div
          whileInView={{ scale: 1.8 }}
          initial={{ scale: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 md:block hidden" // Hides animation on mobile
        >
          <Image
            src='/assets/edurein.svg'
            alt='edu reinvented'
            width={207}
            height={247}
            draggable={false}
            className='w-[317px] h-[279px] rotate-[-6.97deg]'
          />
        </motion.div>

        {/* Static Image for Mobile */}
        <div className="relative z-10 md:hidden">
          <Image
            src='/assets/edurein.svg'
            alt='edu reinvented'
            width={207}
            height={247}
            draggable={false}
            className='w-[317px] h-[279px] rotate-[-6.97deg]'
          />
        </div>

      </div>
      <div className='grid md:grid-cols-2 grid-cols-1 gap-5 mt-5 w-fit mx-auto'>
        <Image src='/assets/card1.svg' alt='All Your Study Materials, All in One Place. Upload PDFs, share YouTube links, and organize your resources with ease.' width={390} height={600} className='md:w-[390px] w-[340px] hover:scale-105 transition-all' draggable={false} />
        <Image src='/assets/card2.svg' alt='Scan, Summarize, and Learn Faster. Easily scan images, summarize PDFs, and break down YouTube videos into key points.' width={390} height={600} className='md:w-[390px] w-[340px] hover:scale-105 transition-all' draggable={false} />
        <Image src='/assets/card3.svg' alt='Stay Motivated with Streaks & Rewards. Build a daily habit, unlock achievements, and make learning more fun.' width={390} height={600} className='md:w-[390px] w-[340px] hover:scale-105 transition-all' draggable={false} />
        <Image src='/assets/card4.svg' alt='Find Your Study Crew. Learn Together. Join or create study groups, upload resources, and keep each other accountable.' width={390} height={600} className='md:w-[390px] w-[340px] hover:scale-105 transition-all' draggable={false} />

      </div>
    </section>
  )
}

export default AboutClark