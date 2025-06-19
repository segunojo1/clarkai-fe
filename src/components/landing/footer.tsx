import Image from 'next/image'
import React from 'react'
import GravityText from './gravity-text'
import Link from 'next/link'

const Footer = () => {
    return (
        <footer className="text-white bg-[url('/assets/landing/bg.png')] bg-contain bg-black font-satoshi  mt-14 z-[99999] relative pt-[55px] min-h-[100vh] ">
            <Image src='/assets/landing/clarkbtn.svg' alt='clark btn' width={107} height={118} className='md:w-[107px] w-[60px] mx-auto' />
            <Image src='/assets/landing/clark_icon4.svg' alt='clark icon' width={169} height={151} className='absolute  md:w-[169px] w-[100px] md:h-[151px] right-0 top-0' />

            <div className="flex flex-col md:flex-row gap-8 justify-between mt-[44px] px-9">
                {/* Left Side */}
                <div className="flex flex-col gap-6">
                    <Image
                        src="/assets/landing/gen_study_materials.svg"
                        alt="clark btn"
                        width={460}
                        height={66}
                    />
                    <p className="text-white max-w-[380px] text-[18px] md:text-[20px]/[120%]">
                        Turn any topic into notes, flashcards, and quizzes—choose from beautiful
                        templates and download as a PDF!
                    </p>
                </div>

                {/* Gravity Text Stays in Position */}
                <GravityText />

                {/* Right Side */}
                <p className="md:text-[30px]/[120%] text-[20px] font-bold text-white z-[9999] relative self-end">
                    ...and Download as PDFs.
                </p>
            </div>

            <div className='md:mt-[235px] mt-[50px] relative px-9'>
                <Image src='/assets/landing/clark_icon5.svg' alt='clark icon' width={169} height={151} className='md:w-[169px] w-[100px] absolute left-0 top-0' />

                <div className='flex flex-col pt-[170px] gap-[39px]'>
                    <p className='text-white md:text-[20px]/[120%] text-[18px] max-w-[380px]'>Transform any topic into organized notes, flashcards, and quizzes—powered by AI. Learn faster, smarter, and on your terms!</p>
                    <Link href='/waitlist' className='py-2 px-4 text-[13px]/[120%] bg-[#F14E07] text-white rounded-[23px] flex items-center gap-2 w-fit z-[9999] relative'>
                        Join the Waitlist
                        <Image src='/assets/landing/clarkbtn.svg' alt='clark btn' width={16} height={17} />
                    </Link>
                </div>

                <ul className='flex flex-col gap-[10px] py-[5px] mt-10 md:mt-0 px-3 items-center text-[13px]/[120%] font-medium md:absolute left-0 right-0 mx-auto w-fit bottom-0 h-fit'>
                <li><Link href='#story'>Story</Link></li>
                <li><Link href='#features'>Features</Link></li>
                    <li className='cursor-pointer'><Link href='mailto:clarkai.tech@gmail.com'>Contact us</Link></li>
                    <li className='cursor-pointer'><Link href='https://lnk.bio/clarkai'>Social</Link></li>
                </ul>
            </div>

            <Image src='/assets/landing/clark_footer.svg' alt='clark footer' width={1496} height={734} className='md:mt-32 mt-14 mx-auto' draggable={false} />

        </footer>
    )
}

export default Footer