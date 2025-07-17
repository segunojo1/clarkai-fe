'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, RotateCw } from 'lucide-react';

interface FlashcardProps {
  question: string;
  answer: string;
  explanation?: string;
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
    <div className="w-full max-w-2xl">
      <div className="w-full h-96 perspective-1000">
        <div 
          className={`relative w-full h-full transition-transform duration-500 transform-gpu ${isFlipped ? 'rotate-y-180' : ''}`}
          style={{
            transformStyle: 'preserve-3d',
          }}
          onClick={() => setIsFlipped(!isFlipped)}
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
            <Card className="w-full h-full bg-white dark:bg-gray-800 flex flex-col">
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
            <Card className="w-full h-full bg-white dark:bg-gray-800 flex flex-col">
              <CardContent className="flex-1 flex flex-col p-6">
                <h3 className="text-xl font-semibold mb-4">Answer</h3>
                <p className="text-lg mb-4">{answer}</p>
                {explanation && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium mb-2">Explanation:</h4>
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
          className="shrink-0"
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
          className="flex items-center gap-2"
        >
          <RotateCw className="h-4 w-4" />
          <span>Flip Card</span>
        </Button>
        
        <div className="text-sm text-muted-foreground mx-4">
          {cardNumber} / {totalCards}
        </div>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          disabled={cardNumber === totalCards}
          className="shrink-0"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
