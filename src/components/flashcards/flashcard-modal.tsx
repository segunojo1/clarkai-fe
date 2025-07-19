'use client'

import { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Flashcard } from './flashcard'
import { FlashcardData } from '@/lib/types'

interface FlashcardModalProps {
  isOpen: boolean
  onClose: () => void
  flashcards: FlashcardData[]
}

export function FlashcardModal({ isOpen, onClose, flashcards }: FlashcardModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, flashcards.length - 1))
  }, [flashcards.length])

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }, [])

  if (flashcards.length === 0) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Flashcards</DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-center">
          <Flashcard
            question={flashcards[currentIndex].question}
            answer={flashcards[currentIndex].answer}
            explanation={flashcards[currentIndex].explanation}
            cardNumber={currentIndex + 1}
            totalCards={flashcards.length}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        </div>

        <div className="flex justify-between mt-4">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
          >
            Next
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
