"use client"
import { Checkbox } from '@/components/ui/checkbox'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import quizService from '@/services/quiz.service'
import { GuestInfoModal } from '@/components/quiz/guest-info-modal'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

const Quiz = () => {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const questionsPerPage = 3
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [quizData, setQuizData] = useState<{
    name: string;
    duration: number;
    questions: Question[];
  } | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [timerStarted, setTimerStarted] = useState(false)

  // Format time in MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start the timer
  const startTimer = () => {
    if (!timerStarted && quizData) {
      setTimerStarted(true);
      setTimeLeft(quizData.duration);
    }
  };

  // Fetch quiz data
  useEffect(() => {
    const token = Cookies.get('token');
    setIsAuthenticated(!!token);
    console.log(isAuthenticated);
    
    
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await quizService.getQuizById(id as string);
        if (response.success && response.quiz && response.questions) {
          // Transform API response to match our Question interface
          const questions = response.questions.map((q, index) => ({
            id: index + 1,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer
          }));

          setQuizData({
            name: response.quiz.name,
            duration: response.quiz.duration * 60, // Convert minutes to seconds
            questions
          });
          setTimeLeft(response.quiz.duration * 60);
        }
      } catch (error) {
        console.error('Failed to fetch quiz:', error);
        toast.error('Failed to load quiz. Please try again.');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id, router]);

  // Timer effect
  useEffect(() => {
    if (!timerStarted || !quizData) return;

    if (timeLeft <= 0) {
      // Time's up!
      toast('Time\'s up! Submitting your answers...');
      handleSubmitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, timerStarted, quizData]);

  const handleAnswerSelect = (questionId: number, answer: string) => {
    if (!timerStarted) startTimer();
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }

  const handleNext = () => {
    if (currentPage < Math.ceil(questions.length / questionsPerPage)) {
      setCurrentPage(prev => prev + 1);
      // Scroll to top when changing pages
      const container = document.querySelector('.overflow-y-auto');
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      // Scroll to top when changing pages
      const container = document.querySelector('.overflow-y-auto');
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='w-8 h-8 animate-spin' />
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p>Failed to load quiz. Please try again.</p>
      </div>
    );
  }

  const { name, questions } = quizData;

  const handleSubmit = () => {
    if (isAuthenticated) {
      setIsSubmitModalOpen(true);
    } else {
      setShowGuestModal(true);
    }
  };

  const handleCloseSubmitModal = () => {
    setIsSubmitModalOpen(false);
  };

  const submitQuiz = async (guestData?: { name: string; email: string }) => {
    try {
      setIsSubmitting(true);
      const answers = Array(questions.length).fill('');
      Object.entries(selectedAnswers).forEach(([questionId, answer]) => {
        const index = parseInt(questionId) - 1;
        if (index >= 0 && index < answers.length) {
          answers[index] = answer;
        }
      });

      const submitData: any = {
        answers,
        timeRemaining: timeLeft.toString(),
        ...(guestData && {
          name: guestData.name,
          email: guestData.email
        })
      };
      
      const response = await quizService.submitQuizAnswers(id as string, submitData);

      if (response.success) {
        toast.success('Quiz submitted successfully!');
        return { success: true };
      } else {
        throw new Error(response.message || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      toast.error(error.message || 'Failed to submit quiz. Please try again.');
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
      setIsSubmitModalOpen(false);
    }
  };

  // For authenticated users
  const handleSubmitQuiz = async () => {
    const result = await submitQuiz();
    if (result?.success) {
      router.push(`/quiz/${id}/overview`);
    }
  };

  // For guest submissions
  const handleGuestSubmit = async (guestData: { name: string; email: string }) => {
    
    console.log(guestData);
    
    const result = await submitQuiz(guestData);
    if (result?.success) {
      setShowGuestModal(false);
      router.push(`/workspaces`);
    }
    return result;
  };

  const handleQuizSubmit = async () => {
    await handleSubmitQuiz();
  };

  return (
    <div className='min-h-screen satoshi bg-[#1a1a1a]'>
      <div className='p-[25px] sticky top-0 bg-[#1a1a1a] z-10 flex justify-between items-center'>
        <h2 className='text-[14px] font-bold'>{name || 'Untitled Quiz'}</h2>
        <button
          onClick={handleSubmit}
          className='px-4 py-2 bg-[#FF3D00] text-white rounded-md text-sm font-medium hover:bg-[#FF4D1A] transition-colors'
        >
          Submit Quiz
        </button>
      </div>

      <section className='flex flex-col lg:flex-row justify-between px-4 lg:px-10 gap-6 lg:gap-[30px] h-[calc(100vh-80px)]'>
        <div className='flex-1 flex flex-col overflow-hidden'>
          <div className='flex-1 overflow-y-auto space-y-6 pr-2'>
            {questions
              .slice((currentPage - 1) * questionsPerPage, currentPage * questionsPerPage)
              .map((question, index) => {
                // Calculate the actual question number based on pagination
                const questionNumber = (currentPage - 1) * questionsPerPage + index + 1;
                return (
                <div
                  key={question.id}
                  className='py-6 px-4 sm:px-6 lg:px-8 bg-[#2C2C2C] rounded-[10px] flex flex-col items-start gap-6'
                >
                  <div className='w-full flex justify-between items-center'>
                    <h3 className='font-bold text-[18px]'>{question.question}</h3>
                    <span className='text-sm text-gray-400'>
                      Question {questionNumber} of {questions.length}
                    </span>
                  </div>
                  <div className='space-y-4 w-full'>
                    {question.options.map((option, optionIndex) => {
                      const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C, etc.
                      return (
                        <div key={optionIndex} className='flex items-center gap-[10px]'>
                          <Checkbox
                            className="h-5 w-5 bg-[#262626] rounded-[5px] border boder-[#fafafa] focus:ring-0 focus:ring-offset-0 peer data-[state=checked]:bg-[#fafafa] data-[state=checked]:bg-[#fafafa] transition-colors duration-200"
                            checked={selectedAnswers[question.id] === option}
                            onCheckedChange={() => handleAnswerSelect(question.id, option)}
                          />
                          <p className='text-[16px]'>{optionLetter}. {option}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                )
              })
            }
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
              onClick={currentPage === Math.ceil(questions.length / questionsPerPage) ? handleSubmit : handleNext}
              className={`px-4 py-2 rounded-tr-[5px] rounded-br-[5px] ${currentPage === Math.ceil(questions.length / questionsPerPage) ? 'bg-[#FF3D00] hover:bg-[#FF4D1A]' : 'bg-[#2C2C2C] hover:bg-[#333333]'} text-white`}
            >
              {currentPage === Math.ceil(questions.length / questionsPerPage) ? 'Submit' : 'Next'}
            </button>
          </div>
        </div>
        <div className='lg:sticky lg:top-20 flex flex-col items-end gap-5 mt-6 lg:mt-0'>
          <div className='flex items-center gap-[10px]'>
            <p className='font-bold text-[16px] text-[#D4D4D4]'>Time Left</p>
            <div className='text-[20px] font-bold py-[6px] px-2 rounded-tr-[6px] rounded-br-[6px] bg-[#2C2C2C] min-w-[100px] text-center'>
              {formatTime(timeLeft)}
            </div>
          </div>
          <div className='grid grid-cols-5 gap-[10px]'>
            {questions.map((_, i) => (
              <button
                key={i + 1}
                className={`w-8 h-8 rounded-[4px] flex items-center justify-center text-sm font-medium ${
                  i >= (currentPage - 1) * questionsPerPage && i < currentPage * questionsPerPage
                    ? 'bg-[#404040]'
                    : selectedAnswers[i + 1]
                    ? 'bg-[#ffffff] text-[#2c2c2c]'
                    : 'bg-[#2c2c2c]'
                }`}
                onClick={() => {
                  const questionNumber = i + 1;
                  const page = Math.ceil(questionNumber / questionsPerPage);
                  setCurrentPage(page);
                  if (!timerStarted) startTimer();
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </section>

      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={handleCloseSubmitModal}
        onSubmit={handleQuizSubmit}
        timeLeft={timeLeft}
        selectedAnswers={selectedAnswers}
        questions={questions}
        isAuthenticated={isAuthenticated}
      />
      <GuestInfoModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onSubmit={handleGuestSubmit}
        isLoading={isSubmitting}
      />
    </div>
  )
}

export default Quiz


interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  timeLeft: number;
  selectedAnswers: Record<number, string>;
  questions: Question[];
  isAuthenticated: boolean;
}

export const SubmitModal: React.FC<SubmitModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  timeLeft,
  selectedAnswers,
  questions,
  isAuthenticated
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { id } = useParams();

  if (!isOpen) return null;

  const timeInMinutes = Math.floor(timeLeft / 60);
  const timeInSeconds = timeLeft % 60;
  const timeFormatted = `${timeInMinutes.toString().padStart(2, '0')}:${timeInSeconds.toString().padStart(2, '0')}`;

  const handleConfirmSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (!isAuthenticated) {
        onClose();
        return;
      }
      await onSubmit();
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#000000bd] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2C2C2C] rounded-lg p-6 w-full max-w-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Submit Quiz</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-[#3a3a3a] p-4 rounded-lg">
            <h3 className="font-semibold mb-4">Are you sure you want to submit your quiz?</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Questions Answered:</span>
                <span>{Object.keys(selectedAnswers).length} of {questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Time Remaining:</span>
                <span>{timeFormatted}</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-300">
              Once submitted, you'll be redirected to view your results.
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-700"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : isAuthenticated ? 'Submit' : 'Submit as Guest'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};