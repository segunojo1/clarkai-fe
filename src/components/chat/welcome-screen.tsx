'use client'

import { useUserStore } from '@/store/user.store';
import UserAvatar from '../user-avatar'
import { SuggestedQuestion } from './suggested-question'

export function WelcomeScreen({ onSend }: { onSend: (message: string) => void }) {

      const { user } = useUserStore();
  
  const suggestedQuestions = [
    {
      text: "Explain Quantum Mechanics like I'm five.",
      type: "physics"
    },
    {
      text: "Graph the derivative of f(x) = 3x² + 2x.",
      type: "math"
    },
    {
      text: "Test me with a quiz on Human Anatomy!",
      type: "anatomy"
    }
  ]

  return (
    <div className="flex flex-col items-center flex-grow">
      <div className="flex items-center gap-5 mb-[71px]">
        <UserAvatar />
        <h1 className='text-[30px]/[120%] font-bold satoshi'>Good Evening, {user?.name?.split(' ')[0]}</h1>
      </div>

      <div className='flex items-center gap-5'>
        {suggestedQuestions.map((question, index) => (
          <SuggestedQuestion
            key={index} 
            type={question.type} 
            text={question.text}
            onClick={() => onSend(question.text)}
          />
        ))}
      </div>
    </div>
  )
}