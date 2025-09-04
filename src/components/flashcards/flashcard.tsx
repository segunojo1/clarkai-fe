'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FlashcardData } from '@/lib/types';

interface FlashcardProps extends Omit<FlashcardData, 'question' | 'answer'> {
  question: string;
  answer: string;
  cardNumber: number;
  totalCards: number;
  onNext: () => void;
  onPrevious: () => void;
}

export function Flashcard({ 
  question, 
  answer, 
  explanation, 
  cardNumber, 
  totalCards,
  onNext,
  onPrevious
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [cardNumber]);

  return (
    <div className="w-full h-full">
      <div 
        className="w-full h-[370px] rounded-xl cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          className={`relative w-full h-full transition-transform duration-500 transform-gpu ${isFlipped ? 'rotate-y-180' : ''}`}
          style={{
            transformStyle: 'preserve-3d',
            height: '100%'
          }}
        >
          {/* Front of card */}
          <div 
            className="absolute w-full h-full rounded-xl"
            style={{
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
            }}
          >
            <Card className="w-full h-full bg-white dark:bg-[#262626] flex flex-col">
              <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <h3 className="text-xl font-semibold mb-4">Question</h3>
                <p className="text-lg mb-6">{question}</p>
                <div className="text-sm text-muted-foreground mt-auto">
                  Click to reveal answer
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Back of card */}
          <div 
            className="absolute w-full h-full rounded-xl"
            style={{
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <Card className="w-full h-full bg-white dark:bg-[#262626] flex flex-col">
              <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <h3 className="text-xl font-semibold mb-4">Answer</h3>
                <p className="text-lg mb-6">{answer}</p>
                {explanation && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg w-full">
                    <h4 className="text-sm font-medium mb-2">Explanation</h4>
                    <p className="text-sm text-muted-foreground">{explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-6 px-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          disabled={cardNumber === 1}
          className="shrink-0 text-black dark:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setIsFlipped(!isFlipped);
          }}
          className="flex text-[14px] font-medium items-center gap-2 dark:text-[#A3A3A3] text-black"
        >
          {cardNumber} / {totalCards}
          <span className='text-[16px] font-medium dark:text-[#FAFAFA]'>Show Front</span>
        </Button>
        
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          disabled={cardNumber === totalCards}
          className="shrink-0 text-black dark:text-white"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
