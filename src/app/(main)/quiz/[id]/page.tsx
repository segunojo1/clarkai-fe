"use client"
import { Checkbox } from '@/components/ui/checkbox'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import quizService from '@/services/quiz.service'
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

  const handleOpenSubmitModal = () => {
    setIsSubmitModalOpen(true);
  };

  const handleCloseSubmitModal = () => {
    setIsSubmitModalOpen(false);
  };

  const handleSubmitQuiz = async () => {
    try {
      // Submit the quiz answers
      // const response = await quizService.submitQuizAnswers(id as string, {
      //   answers: Object.entries(selectedAnswers).map(([questionId, answer]) => ({
      //     questionId: parseInt(questionId),
      //     answer
      //   }))
      // });

      // if (response.success) {
        toast.success('Quiz submitted successfully!');
        // Navigate to results or dashboard
        router.push('/workspaces');
      // }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      toast.error('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitModalOpen(false);
    }
  };

  return (
    <div className='min-h-screen satoshi bg-[#1a1a1a]'>
      <div className='p-[25px] sticky top-0 bg-[#1a1a1a] z-10 flex justify-between items-center'>
        <h2 className='text-[14px] font-bold'>{name || 'Untitled Quiz'}</h2>
        <button
          onClick={handleOpenSubmitModal}
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
              onClick={handleNext}
              className='px-4 py-2 rounded-tr-[5px] rounded-br-[5px] bg-[#2C2C2C] text-white hover:bg-[#333333]'
              disabled={currentPage === Math.ceil(questions.length / questionsPerPage)}
            >
              Next
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
        onSubmit={handleSubmitQuiz}
        timeLeft={timeLeft}
        selectedAnswers={selectedAnswers}
        questions={questions}
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
}

export const SubmitModal: React.FC<SubmitModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  timeLeft,
  selectedAnswers,
  questions
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Calculate score and results
  const calculateResults = () => {
    let correct = 0;
    const results = questions.map((question) => {
      const userAnswer = selectedAnswers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) correct++;
      
      return {
        question: question.question,
        userAnswer: userAnswer || 'Not answered',
        correctAnswer: question.correctAnswer,
        isCorrect,
        questionId: question.id
      };
    });

    return {
      score: correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
      results
    };
  };

  const { score, total, percentage, results } = calculateResults();
  const timeInMinutes = Math.floor(timeLeft / 60);
  const timeInSeconds = timeLeft % 60;
  const timeFormatted = `${timeInMinutes.toString().padStart(2, '0')}:${timeInSeconds.toString().padStart(2, '0')}`;

  const handleConfirmSubmit = async () => {
    if (!isConfirmed) {
      setIsConfirmed(true);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2C2C2C] rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold">
            {isConfirmed ? 'Quiz Results' : 'Submit Quiz'}
          </h2>
          {!isConfirmed && (
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {!isConfirmed ? (
          <div className="space-y-6">
            <div className="bg-[#3a3a3a] p-4 rounded-lg">
              <h3 className="font-semibold mb-4">Are you sure you want to submit your quiz?</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Questions Answered:</span>
                  <span>{Object.keys(selectedAnswers).length} of {total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time Remaining:</span>
                  <span>{timeFormatted}</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-300">
                Once submitted, you won't be able to change your answers.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded bg-[#404040] text-white hover:bg-[#505050] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="px-4 py-2 rounded bg-[#FF3D00] text-white hover:bg-[#FF4D1A] transition-colors"
              >
                Submit Quiz
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-[#3a3a3a] p-4 rounded-lg">
              <h3 className="font-semibold mb-4">Quiz Results</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Questions Answered</p>
                  <p className="text-lg">{Object.keys(selectedAnswers).length} / {total}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Time Remaining</p>
                  <p className="text-lg">{timeFormatted}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Your Score</p>
                  <p className="text-2xl font-bold">{score} / {total}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Percentage</p>
                  <p 
                    className={`text-2xl font-bold ${
                      percentage >= 70 ? 'text-green-500' : 
                      percentage >= 50 ? 'text-yellow-500' : 'text-red-500'
                    }`}
                  >
                    {percentage}%
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Your Answers</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {results.map((result, index) => (
                  <div key={index} className="border-b border-[#404040] pb-3 last:border-0">
                    <p className="font-medium">Q{result.questionId}. {result.question}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 text-sm">
                      <div>
                        <p className="text-gray-400">Your answer:</p>
                        <p className={result.isCorrect ? 'text-green-400' : 'text-red-400'}>
                          {result.userAnswer}
                        </p>
                      </div>
                      {!result.isCorrect && (
                        <div>
                          <p className="text-gray-400">Correct answer:</p>
                          <p className="text-green-400">{result.correctAnswer}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded bg-[#404040] text-white hover:bg-[#505050] transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 rounded bg-[#FF3D00] text-white hover:bg-[#FF4D1A] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};