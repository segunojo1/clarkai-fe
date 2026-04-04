'use client'

import { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Flashcard } from './flashcard'
import { FlashcardData } from '@/lib/types'

function downloadFile(filename: string, data: string, type = 'application/json') {
  const blob = new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function flashcardsToCSV(flashcards: FlashcardData[]) {
  const header = ['Question', 'Answer', 'Explanation']
  const rows = flashcards.map((f) => [f.question, f.answer, f.explanation || ''])
  const csv = [header, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  return csv
}

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

        <div className="flex justify-between mt-4 items-center">
          <div className="flex gap-2">
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

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                const json = JSON.stringify(flashcards, null, 2)
                downloadFile('flashcards.json', json, 'application/json')
              }}
            >
              Download JSON
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const csv = flashcardsToCSV(flashcards)
                downloadFile('flashcards.csv', csv, 'text/csv')
              }}
            >
              Download CSV
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
