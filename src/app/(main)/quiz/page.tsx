"use client"
import { Checkbox } from '@/components/ui/checkbox'
import React, { useState } from 'react'

const Quiz = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const questionsPerPage = 3
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})

  const mockQuestions = [
    {
      id: 1,
      question: "What pigment is primarily responsible for photosynthesis in plants?",
      options: [
        { id: 'A', text: "Hemoglobin" },
        { id: 'B', text: "Chlorophyll" },
        { id: 'C', text: "Melanin" },
        { id: 'D', text: "Carotene" }
      ],
      correctAnswer: 'B'
    },
    {
      id: 2,
      question: "Which part of the plant cell contains chloroplasts?",
      options: [
        { id: 'A', text: "Nucleus" },
        { id: 'B', text: "Cell membrane" },
        { id: 'C', text: "Vacuole" },
        { id: 'D', text: "Cytoplasm" }
      ],
      correctAnswer: 'D'
    },
    {
      id: 3,
      question: "What is the main product of photosynthesis?",
      options: [
        { id: 'A', text: "Carbon dioxide" },
        { id: 'B', text: "Oxygen" },
        { id: 'C', text: "Water" },
        { id: 'D', text: "Glucose" }
      ],
      correctAnswer: 'D'
    },
    {
      id: 4,
      question: "What is the main product of photosynthesis?",
      options: [
        { id: 'A', text: "Carbon dioxide" },
        { id: 'B', text: "Oxygen" },
        { id: 'C', text: "Water" },
        { id: 'D', text: "Glucose" }
      ],
      correctAnswer: 'D'
    }
  ]

  const handleAnswerSelect = (questionId: number, answerId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }))
  }

  const handleNext = () => {
    if (currentPage < Math.ceil(mockQuestions.length / questionsPerPage)) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  return (
    <div className='pt-10 satoshi'>
      <div className='p-[25px]'>
        <h2 className='text-[14px] font-bold '>Intro to Photosynthesis.cqz</h2>
      </div>

      <section className='flex justify-between px-10 gap-[30px]'>
        <div className='flex flex-col gap-[30px] items-end'>
          <div className='space-y-6'>
            {mockQuestions
              .slice((currentPage - 1) * questionsPerPage, currentPage * questionsPerPage)
              .map((question, index) => (
                <div
                  key={question.id}
                  className='py-[25px] px-[50px] bg-[#2C2C2C] rounded-[10px] flex flex-col items-start gap-[30px]'
                >
                  <h3 className='font-bold text-[18px]'>{question.question}</h3>
                  <div className='space-y-4'>
                    {question.options.map((option) => (
                      <div key={option.id} className='flex items-center gap-[10px]'>
                        <Checkbox
                          className="h-5 w-5 bg-[#262626] rounded-[5px] border boder-[#fafafa] focus:ring-0 focus:ring-offset-0 peer data-[state=checked]:bg-[#fafafa] data-[state=checked]:bg-[#fafafa] transition-colors duration-200"
                          checked={selectedAnswers[question.id] === option.id}
                          onCheckedChange={() => handleAnswerSelect(question.id, option.id)}
                        />
                        <p className='text-[16px]'>{option.id}. {option.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
          <div className='flex justify-center gap-4 py-4'>
            <button
              onClick={handlePrev}
              className='px-4 py-2 rounded-tl-[5px] rounded-bl-[5px] bg-[#2C2C2C] text-white hover:bg-[#333333]'
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className='px-4 py-2 rounded-tr-[5px] rounded-br-[5px] bg-[#2C2C2C] text-white hover:bg-[#333333]'
              disabled={currentPage === Math.ceil(mockQuestions.length / questionsPerPage)}
            >
              Next
            </button>
          </div>
        </div>
        <div className='flex flex-col items-end  gap-5'>
          <div className='flex items-center gap-[10px]'>
            <p className='font-bold text-[16px] text-[#D4D4D4]'>Time Left</p>
            <p className='text-[20px] font-bold py-[6px] px-2 rounded-tr-[6px] rounded-br-[6px] bg-[#2C2C2C]'>10 mins</p>
          </div>
          <div className='grid grid-cols-5 gap-[10px]'>
            {Array.from({ length: 30 }, (_, i) => (
              <button
                key={i + 1}
                className={`w-8 h-8 rounded-[4px] flex items-center justify-center text-sm font-medium ${i >= (currentPage - 1) * questionsPerPage && i < currentPage * questionsPerPage ?
                    'bg-[#404040]' :
                    selectedAnswers[i + 1]?.length > 0 ? 'bg-[#ffffff] text-[#2c2c2c]' : 'bg-[#2c2c2c]'
                  }`}
                onClick={() => {
                  const questionNumber = i + 1
                  const page = Math.ceil(questionNumber / questionsPerPage)
                  setCurrentPage(page)
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}

export default Quiz


export const QuizQuestion = () => {
  return (
    <div className='py-[25px] px-[50px] bg-[#2C2C2C] rounded-[10px] flex flex-col items-start gap-[30px] max-w-[684px]'>
      <h3 className='font-bold text-[18px]'>1. What pigment is primarily responsible for photosynthesis in plants?</h3>
      <div className='space-y-4'>
        <div className='flex items-center gap-[10px]'>
          <Checkbox />
          <p className='text-[16px]'>A. Hemoglobin</p>
        </div>
        <div className='flex items-center gap-[10px]'>
          <Checkbox />
          <p className='text-[16px]'>B. Chlorophyll</p>
        </div>
        <div className='flex items-center gap-[10px]'>
          <Checkbox />
          <p className='text-[16px]'>C. Melanin</p>
        </div>
        <div className='flex items-center gap-[10px]'>
          <Checkbox />
          <p className='text-[16px]'>D. Carotene</p>
        </div>
      </div>
    </div>
  )
}
