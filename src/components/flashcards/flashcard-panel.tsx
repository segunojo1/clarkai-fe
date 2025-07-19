'use client'

import { useState, useCallback, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Flashcard } from './flashcard'
import { FlashcardData } from '@/lib/types'

interface FlashcardPanelProps {
  isOpen: boolean
  onClose: () => void
  flashcards: FlashcardData[]
}

export function FlashcardPanel({ isOpen, onClose, flashcards }: FlashcardPanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  // Reset index when flashcards change
  useEffect(() => {
    if (flashcards.length > 0) {
      setCurrentIndex(0)
    }
  }, [flashcards])

  // Handle mount state for animations
  useEffect(() => {
    if (isOpen) {
      // Force a reflow to ensure the initial state is applied before animation
      document.body.style.overflow = 'hidden';
      // Small timeout to ensure the initial state is rendered
      const timer = setTimeout(() => {
        setIsMounted(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsMounted(false);
      document.body.style.overflow = 'auto';
    }
  }, [isOpen])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, flashcards.length - 1))
  }, [flashcards.length])

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out ${
          isMounted ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transition: 'opacity 300ms ease-in-out',
          willChange: 'opacity',
          pointerEvents: isMounted ? 'auto' : 'none'
        }}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        className={`fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-[#2C2C2C] shadow-xl`}
        style={{
          transform: isMounted ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform',
          pointerEvents: 'auto',
          zIndex: 50
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-lg font-semibold">Flashcards</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-56px)] flex flex-col">
          {/* Flashcard Counter */}
          <div className="px-6 pt-4 text-sm text-gray-500 dark:text-gray-400">
            Card {currentIndex + 1} of {flashcards.length}
          </div>

          {/* Flashcard */}
          <div className="flex-1 flex items-center justify-center p-6">
            {flashcards.length > 0 ? (
              <Flashcard
                question={flashcards[currentIndex].question}
                answer={flashcards[currentIndex].answer}
                explanation={flashcards[currentIndex].explanation}
                cardNumber={currentIndex + 1}
                totalCards={flashcards.length}
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400">
                No flashcards available
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between gap-4">
            <Button
              variant="outline"
              className="flex-1 bg-white dark:bg-[#262626] hover:bg-gray-50 dark:hover:bg-[#333] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            >
              Preview Set ({flashcards.length} cards)
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-white dark:bg-[#262626] hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:text-red-700 dark:hover:text-red-300"
            >
              Delete Set
            </Button>
          </div>

          <div className='text-[15px] rounded-[4px] mx-[10px] mb-[10px] font-normal text-white px-[30px] py-[10px] bg-[#ff3c0027]'>You can also generate a quiz based on this set — just type @quiz or generate another Flashcard set using @flashcard</div>
        </div>
      </div>
    </div>
  )
}
