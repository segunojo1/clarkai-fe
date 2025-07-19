"use client"
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Clock, BookOpen, Calendar, BarChart2, Loader2, Medal, Trophy, Award, FileText } from 'lucide-react';
import quizService from '@/services/quiz.service';
import { toast } from 'sonner';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  userAnswer: string;
  isCorrect: boolean;
}

interface QuizDetails {
  name: string;
  creator: string;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  percentage: string;
  questions: QuizQuestion[];
  userEmail: string;
  quizSource?: string;
  quizSourceType?: string;
  createdAt?: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  email: string;
  score: number;
  totalQuestions: number;
  percentage: string;
  timeTaken?: string | null;
  submittedAt?: string;
}

interface LeaderboardResponse {
  success: boolean;
  message: string;
  leaderboard: LeaderboardEntry[];
  totalParticipants?: number;
  averageScore?: string;
  quiz_id?: string;
}

// Utility function to format time in seconds to MM:SS format
const formatTime = (timeInSeconds: number | string | undefined): string => {
  // Convert string to number if needed
  const seconds = typeof timeInSeconds === 'string' 
    ? parseInt(timeInSeconds, 10) 
    : timeInSeconds || 0;
    
  if (isNaN(seconds as number)) return '0:00';
  
  const minutes = Math.floor(Number(seconds) / 60);
  const remainingSeconds = Number(seconds) % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Utility function to format date string
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Unknown date';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Unknown date';
  }
};

const Overview = () => {
  const { id } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('breakdown');
  const [loading, setLoading] = useState(true);
  const [quizDetails, setQuizDetails] = useState<QuizDetails | null>(null);
  const [quizMetadata, setQuizMetadata] = useState<{
    id: string;
    name: string;
    creator: string;
    createdAt: string;
    duration: number;
  } | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalParticipants: number;
    averageScore: string;
  } | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setLeaderboardLoading(true);
      const response = await quizService.getQuizLeaderboard(id as string) as LeaderboardResponse;
      if (response.success) {
        setLeaderboard(response.leaderboard);
        if (response.totalParticipants !== undefined && response.averageScore !== undefined) {
          setStats({
            totalParticipants: response.totalParticipants,
            averageScore: response.averageScore
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'leaderboard' && leaderboard.length === 0) {
      fetchLeaderboard();
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchQuizResults = async () => {
      try {
        setLoading(true);
        const response = await quizService.getUserQuizScore(id as string);
        
        if (response.success && response.userScore && response.quiz) {
          // Set quiz metadata
          setQuizMetadata({
            id: response.quiz.id,
            name: response.quiz.name,
            creator: response.quiz.creator,
            createdAt: response.quiz.createdAt,
            duration: response.quiz.duration
          });
          
          // Transform the response to match our QuizDetails interface
          setQuizDetails({
            name: response.quiz.name,
            creator: response.quiz.creator,
            score: parseInt(response.userScore.userScore, 10),
            totalQuestions: parseInt(response.userScore.totalQuestions, 10),
            timeTaken: response.userScore.timeTaken || 0,
            percentage: response.userScore.percentage,
            questions: response.quizData || [],
            userEmail: response.userScore.userEmail,
            quizSource: response.quiz.quizSource,
            quizSourceType: response.quiz.quizSourceType,
            createdAt: response.quiz.createdAt
          });
        }
      } catch (error) {
        console.error('Failed to fetch quiz results:', error);
        setError('Failed to load quiz results. Please try again.');
        toast.error('Failed to load quiz results');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchQuizResults();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !quizDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 mb-4">{'Failed to load quiz results'}</div>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const percentage = parseFloat(quizDetails.percentage.replace('%', ''));

  return (
    <div className="container mx-auto p-4 md:p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Quiz Overview</h1>

      {/* Quiz Summary Card */}
      <Card className="mb-8 max-w-[588px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{quizDetails.name}</CardTitle>
          <p className="text-sm text-gray-400">Created by {quizDetails.creator}</p>
          <p className="text-sm text-gray-400">Taken by: {quizDetails.userEmail}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{quizDetails.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <BarChart2 className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Class average - 86% of 27</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Source - {quizDetails.quizSource || 'biology_notes.pdf'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Time Taken - {formatTime(quizDetails.timeTaken)} mins</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Created Date - {formatDate(quizDetails.createdAt)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Avg Time Taken - 07:00 mins</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Award className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>
                      Score - {quizDetails.score}/{quizDetails.totalQuestions} ({percentage}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="breakdown" className="w-full ">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-6 mx-auto">
          <TabsTrigger value="breakdown" onClick={() => setActiveTab('breakdown')}>
            Question Breakdown
          </TabsTrigger>
          <TabsTrigger 
            value="leaderboard" 
            onClick={() => setActiveTab('leaderboard')}
            className="flex items-center gap-2"
          >
            <span>Leaderboard</span>
            {leaderboardLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {stats && !leaderboardLoading && (
              <span className="text-xs bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">
                {stats.totalParticipants} participants
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown">
          <Card className='bg-transparent'>
            <CardContent className="pt-6 max-w-[486px] mx-auto">
              <div className="space-y-6">
                {quizDetails.questions.map((question, index) => (
                  <div key={index} className="space-y-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-3">
                      {question.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="space-y-3 flex-1">
                        <p className="font-medium">{question.question}</p>
                        
                        {/* Display options if available */}
                        {question.options && question.options.length > 0 && (
                          <div className="space-y-2 mt-2">
                            {question.options.map((option, optIndex) => {
                              const isUserAnswer = option === question.userAnswer;
                              const isCorrect = option === question.correctAnswer;
                              
                              return (
                                <div 
                                  key={optIndex}
                                  className={`p-3 rounded-md border ${
                                    isCorrect 
                                      ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20' 
                                      : isUserAnswer && !isCorrect
                                        ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20'
                                        : 'border-gray-200 dark:border-gray-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span>
                                    <span>{option}</span>
                                    {isCorrect && (
                                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                                        Correct
                                      </span>
                                    )}
                                    {isUserAnswer && !isCorrect && (
                                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">
                                        Your answer
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* Explanation */}
                        {question.explanation && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm border-l-4 border-blue-300 dark:border-blue-700">
                            <p className="font-medium text-blue-700 dark:text-blue-300">Explanation:</p>
                            <p className="text-blue-600 dark:text-blue-200">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4 max-w-[586px] mx-auto">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Participants</div>
                  <div className="text-2xl font-bold">{stats.totalParticipants}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Average Score</div>
                  <div className="text-2xl font-bold">{stats.averageScore}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Your Position</div>
                  <div className="text-2xl font-bold">
                    {leaderboard.findIndex(entry => entry.email === quizDetails?.userEmail) + 1 || 'N/A'}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <Card className='border-0'>
            <CardContent className="pt-6">
              {leaderboardLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : leaderboard.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="w-20 text-left py-3 px-4 font-medium">Rank</th>
                        <th className="text-left py-3 px-4 font-medium">Name</th>
                        <th className="text-right py-3 px-4 font-medium">Score</th>
                        <th className="text-right py-3 px-4 font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry) => (
                        <tr 
                          key={entry.rank} 
                          className={`border-b border-gray-100 dark:border-gray-800 ${
                            entry.email === quizDetails?.userEmail ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {entry.rank === 1 ? (
                                <Trophy className="w-5 h-5 text-yellow-500" fill="currentColor" />
                              ) : entry.rank === 2 ? (
                                <Medal className="w-5 h-5 text-gray-400" fill="currentColor" />
                              ) : entry.rank === 3 ? (
                                <Award className="w-5 h-5 text-amber-600" fill="currentColor" />
                              ) : (
                                <span className="text-gray-400 text-sm font-medium">{entry.rank}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-medium">{entry.name}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{entry.email}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-medium">
                                {entry.score} / {entry.totalQuestions}
                              </span>
                              <span className={`text-xs ${
                                parseFloat(entry.percentage) >= 70 ? 'text-green-600 dark:text-green-400' :
                                parseFloat(entry.percentage) >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-red-600 dark:text-red-400'
                              }`}>
                                {entry.percentage}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right text-sm text-gray-500 dark:text-gray-400">
                            {entry.timeTaken || '--:--'}
                            {entry.email === quizDetails?.userEmail && (
                              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                You
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No leaderboard data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div >
  );
};

export default Overview;

