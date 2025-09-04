"use client"
import { Checkbox } from '@/components/ui/checkbox'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import quizService from '@/services/quiz.service'
import { GuestInfoModal } from '@/components/quiz/guest-info-modal'
import { SubmitModal } from '@/components/quiz/submit-modal'
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
  const [submitModalLoading, setSubmitModalLoading] = useState(false);

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
        router.back();
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

      interface SubmitQuizData {
        answers: string[];
        timeRemaining: string;
        name?: string;
        email?: string;
      }
      
      const submitData: SubmitQuizData = {
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit quiz. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: error instanceof Error ? error : new Error('Unknown error occurred') };
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
    <div className='min-h-screen satoshi dark:bg-[#1a1a1a] bg-[#FAFAFA]'>
      <div className='p-[25px] sticky top-0 dark:bg-[#1a1a1a] bg-[#FAFAFA] z-10 flex justify-between items-center'>
        <h2 className='text-[14px] font-bold'>{name || 'Untitled Quiz'}</h2>
        <button
          onClick={handleSubmit}
          className='px-4 py-2 bg-[#FF3D00] dark:text-white text-black rounded-md text-sm font-medium hover:bg-[#FF4D1A] transition-colors'
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
                  className='py-6 px-4 sm:px-6 lg:px-8 dark:bg-[#2C2C2C] bg-white rounded-[10px] flex flex-col items-start gap-6'
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
                            className="h-5 w-5 dark:bg-[#262626] bg-white rounded-[5px] border boder-[#fafafa] focus:ring-0 focus:ring-offset-0 peer data-[state=checked]:bg-[#fafafa] data-[state=checked]:bg-[#fafafa] transition-colors duration-200"
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
            <p className='font-bold text-[16px] dark:text-[#D4D4D4] text-black'>Time Left</p>
            <div className='text-[20px] font-bold py-[6px] px-2 rounded-tr-[6px] rounded-br-[6px] dark:bg-[#2C2C2C] bg-white min-w-[100px] text-center'>
              {formatTime(timeLeft)}
            </div>
          </div>
          <div className='grid grid-cols-5 gap-[10px]'>
            {questions.map((_, i) => (
              <button
                key={i + 1}
                className={`w-8 h-8 rounded-[4px] flex items-center justify-center text-sm font-medium ${
                  i >= (currentPage - 1) * questionsPerPage && i < currentPage * questionsPerPage
                    ? 'bg-[#404040] dark:text-[#2c2c2c] text-white'
                    : selectedAnswers[i + 1]
                    ? 'bg-[#ffffff] text-[#2c2c2c]'
                    : 'bg-[#2c2c2c] dark:text-[#2c2c2c] text-white'
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
        loading={submitModalLoading}
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