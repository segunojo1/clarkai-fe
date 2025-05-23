'use client'

import Image from 'next/image'

interface SuggestedQuestionProp {
    type: string
    text: string
    onClick: () => void
}

export const SuggestedQuestion = ({ type, text, onClick }: SuggestedQuestionProp) => {
    const icons = {
        physics: '/assets/orange.png',
        math: '/assets/blue.png',
        anatomy: '/assets/green.png'
    }

    return (
        <button 
          onClick={onClick}
          className='w-[192px] flex flex-col items-center gap-[5px] px-5 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
        >
            <Image 
              src={icons[type as keyof typeof icons] || '/assets/orange.png'} 
              alt='' 
              width={30} 
              height={30} 
            />
            <p className='text-center text-[15px] font-normal'>{text}</p>
        </button>
    )
}