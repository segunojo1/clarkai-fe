'use client'

import { useState, useCallback, useEffect } from 'react'
import { X, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
// Remove unused Flashcard import since we're not using it anymore
import { useWorkspaceStore } from '@/store/workspace.store'
import { Flashcard } from './flashcard'
import { FlashcardData } from '@/lib/types'


interface FlashcardResponse {
  success: boolean;
  message: string;
  flashcard: {
    id: string;
    workspaceId: string;
    createdAt: string;
    updatedAt: string;
  };
  questions: FlashcardData[];
}

interface FlashcardPanelProps {
  isOpen: boolean;
  onClose: () => void;
  flashcards?: FlashcardData[];
  flashcardId: string | null;
}

export function FlashcardPanel({ isOpen, onClose, flashcardId, flashcards: initialFlashcards = [] }: FlashcardPanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashcardData, setFlashcardData] = useState<{
    id: string;
    workspaceId: string;
    
    questions: FlashcardData[];
    createdAt: string;
    updatedAt: string;
  } | null>(null);
  const [showingAnswer, setShowingAnswer] = useState(false);
  const { fetchFlashcard } = useWorkspaceStore();
  // Fetch flashcards when the panel is opened or flashcardId changes
  useEffect(() => {
    const fetchFlashcards = async () => {
      if (!flashcardId || !isOpen) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = (await fetchFlashcard(flashcardId)) as unknown as FlashcardResponse;
        console.log(showingAnswer);
        
        if (response?.success && response.flashcard) {
          setFlashcardData({
            ...response.flashcard,
            questions: response.questions || []
          });
          setCurrentIndex(0);
          setShowingAnswer(false);
        } else {
          setError('Failed to load flashcard data');
        }
      } catch (err) {
        console.error('Failed to fetch flashcards:', err);
        setError('Failed to load flashcard. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (flashcardId) {
      fetchFlashcards().catch((err) => {
        console.error('Error in fetchFlashcards:', err);
      });
    } else if (initialFlashcards?.length) {
      setFlashcardData({
        id: 'local-flashcard',
        workspaceId: '',
        questions: initialFlashcards,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setCurrentIndex(0);
      setShowingAnswer(false);
    }
  }, [flashcardId, isOpen, fetchFlashcard, initialFlashcards]);

  // Handle mount state for animations
  useEffect(() => {
    if (isOpen) {
      // Force a reflow to ensure the initial state is applied before animation
      document.body.style.overflow = 'hidden';
      // Small timeout to ensure the initial state is rendered
      const timer = setTimeout(() => {
        setIsMounted(true);
      }, 10);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'auto';
        setIsMounted(false);
      };
    } else {
      setIsMounted(false);
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  const handleNext = useCallback(() => {
    if (!flashcardData?.questions) return;
    setCurrentIndex((prev) => {
      const newIndex = Math.min(prev + 1, flashcardData.questions.length - 1);
      if (newIndex !== prev) {
        setShowingAnswer(false);
      }
      return newIndex;
    });
  }, [flashcardData?.questions]);

  const handlePrevious = useCallback(() => {
    if (!flashcardData?.questions) return;
    setCurrentIndex((prev) => {
      const newIndex = Math.max(prev - 1, 0);
      if (newIndex !== prev) {
        setShowingAnswer(false);
      }
      return newIndex;
    });
  }, [flashcardData?.questions]);

  // const toggleAnswer = useCallback(() => {
  //   setShowingAnswer(prev => !prev);
  // }, []);

  if (!isMounted || !flashcardId) return null;

  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-none"
      style={{
        transition: 'opacity 300ms ease-in-out',
        willChange: 'opacity'
      }}
    >
      {/* Backdrop with click handler */}
      {isMounted && (
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out"
          style={{
            opacity: isMounted ? 0.5 : 0,
            pointerEvents: isMounted ? 'auto' : 'none'
          }}
          onClick={onClose}
        />
      )}
       
      {/* Panel */}
      <div 
        className={`h-full w-full sm:w-1/2 md:w-1/2 lg:w-1/3 xl:w-1/4 bg-white dark:bg-[#2C2C2C] shadow-xl flex flex-col ml-auto pointer-events-auto`}
        style={{
          transform: isMounted ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform',
          maxWidth: '500px',
          minWidth: '300px',
          height: '100vh',
          position: 'fixed',
          right: 0,
          top: 0
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
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading flashcards...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="text-red-500 mb-2">
                  <AlertCircle className="h-8 w-8 mx-auto" />
                </div>
                <p className="text-gray-700 dark:text-gray-300">{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => flashcardId && fetchFlashcard(flashcardId)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          ) : flashcardData?.questions?.length ? (
            <div className="w-full h-full flex flex-col">
              {/* Flashcard Counter */}
              <div className="px-6 pt-4 text-sm text-gray-500 dark:text-gray-400">
                Card {currentIndex + 1} of {flashcardData.questions.length}
              </div>

              {/* Flashcard */}
              <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-auto">
                <Flashcard
                  question={flashcardData.questions[currentIndex].question}
                  answer={flashcardData.questions[currentIndex].answer}
                  explanation={flashcardData.questions[currentIndex].explanation}
                  cardNumber={currentIndex + 1}
                  totalCards={flashcardData.questions.length}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">No flashcards available</p>
            </div>
          )}

        {/* Action Buttons */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between gap-4">
          <Button
            variant="outline"
            className="flex-1 bg-white dark:bg-[#262626] hover:bg-gray-50 dark:hover:bg-[#333] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
          >
            Preview Set ({flashcardData?.questions?.length || 0} cards)
          </Button>
          <Button
            variant="outline"
            className="flex-1 bg-white dark:bg-[#262626] hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:text-red-700 dark:hover:text-red-300"
          >
            Delete Set
          </Button>
        </div>

        <div className='text-[15px] rounded-[4px] mx-[10px] mb-[10px] font-normal text-white px-[30px] py-[10px] bg-[#ff3c0027]'>
          You can also generate a quiz based on this set — just type @quiz or generate another Flashcard set using
        </div>
      </div>
    </div>
  </div>
  )
}                                     
