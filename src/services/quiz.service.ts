import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";

type QuizMode = 'file' | 'workspace';
type QuizDifficulty = 'easy' | 'medium' | 'hard';

interface GenerateQuizParams {
  workspace_id?: string;
  size: number;
  name: string;
  mode: QuizMode;
  file_id?: string;
  difficulty?: QuizDifficulty;
  duration?: number;
  context: string;
  is_context?: boolean
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizData {
  id: string;
  name: string;
  creator: string;
  workspaceId: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

// interface SubmitQuizAnswersParams {
//   answers: Array<{
//     questionId: number;
//     answerId: string;
//   }>;
// }

// interface SubmitQuizResponse {
//   success: boolean;
//   score: number;
//   total: number;
//   correctAnswers: number;
//   incorrectAnswers: number;
//   percentage: number;
//   results: Array<{
//     questionId: number;
//     question: string;
//     userAnswer: string;
//     correctAnswer: string;
//     isCorrect: boolean;
//   }>;
// }

interface GetQuizResponse {
  success: boolean;
  message: string;
  quiz: QuizData;
  questions: QuizQuestion[];
}

interface GenerateQuizResponse {
  success: boolean;
  quiz_id: string;
  name: string;
  questions: QuizQuestion[];
  mode: QuizMode;
  created_at: string;
}

class QuizService {
  private static instance: QuizService;
  private api: AxiosInstance;

  private constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
      headers: {
        "Content-Type": "application/json"
      }
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = Cookies.get("token");
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  public static getInstance(): QuizService {
    if (!QuizService.instance) {
      QuizService.instance = new QuizService();
    }
    return QuizService.instance;
  }

  public async generateQuiz(params: GenerateQuizParams): Promise<GenerateQuizResponse> {
    try {
      const response = await this.api.post('/generateQuiz', {
        workspace_id: params.workspace_id,
        size: params.size,
        name: params.name,
        mode: params.mode,
        file_id: params.file_id,
        difficulty: params.difficulty || 'medium',
        duration: params.duration,
        context: params.context,
        is_context: params.is_context
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to generate quiz');
      }

      return {
        success: response.data.success,
        quiz_id: response.data.quiz_id,
        name: response.data.name,
        questions: response.data.questions,
        mode: response.data.mode,
        created_at: response.data.created_at
      };
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      throw error;
    }
  }

  public async getQuizById(quizId: string): Promise<GetQuizResponse> {
    try {
      const response = await this.api.get<GetQuizResponse>(`/quiz/${quizId}`);
      return {
        success: response.data.success,
        message: response.data.message,
        quiz: response.data.quiz,
        questions: response.data.questions || []
      };
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
      throw error;
    }
  }

  public async submitQuizAnswers(quizId: string, params: {
    answers: string[];
    timeRemaining: string;
    name?: string;
    email?: string;
  }): Promise<{
    success: boolean;
    message: string;
    userScore: any;
  }> {
    try {
      const payload: any = {
        quiz_id: quizId,
        answers: params.answers,
        time_remaining: params.timeRemaining
      };

      // Add guest info if provided
      if (params.name && params.email) {
        payload.name = params.name;
        payload.email = params.email;
      }

      const response = await this.api.post('/assessAnswers', payload);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to submit quiz answers');
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to submit quiz answers:', error);
      throw error;
    }
  }
  public async getUserQuizScore(quizId: string): Promise<{
    success: boolean;
    message: string;
    userScore: {
      name: string;
      userEmail: string;
      quizId: string;
      userScore: string;
      totalQuestions: string;
      timeTaken: number;
      userAnswers: string; // JSON string of user answers
      percentage: string;
    };
    quiz: {
      id: string;
      name: string;
      creator: string;
      userId: number;
      workspaceId: string;
      fileId: string;
      quizSource: string;
      quizSourceType: string;
      duration: number;
      createdAt: string;
      updatedAt: string;
    };
    quizData: Array<{
      question: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
      userAnswer: string;
      isCorrect: boolean;
    }>;
  }> {
    try {
      const response = await this.api.get(`/quizScore/${quizId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch quiz score');
      }
      
      // Transform the response to match our expected format
      const { quizData, ...rest } = response.data;
      
      // Parse userAnswers if it's a string
      if (typeof rest.userScore.userAnswers === 'string') {
        try {
          rest.userScore.userAnswers = JSON.parse(rest.userScore.userAnswers);
        } catch (e) {
          console.warn('Failed to parse userAnswers:', e);
        }
      }
      
      return {
        ...rest,
        quizData: quizData || []
      };
    } catch (error) {
      console.error('Failed to fetch quiz score:', error);
      throw error;
    }
  }

  public async getQuizDetails(quizId: string): Promise<{
    success: boolean;
    message: string;
    data: {
      name: string;
      timeLimit?: number;
      questions: Array<{
        question: string;
        options: string[];
      }>;
    };
  }> {
    try {
      const response = await this.api.get(`/quiz/${quizId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch quiz details');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch quiz details:', error);
      throw error;
    }
  }

  public async getQuizLeaderboard(quizId: string): Promise<{
    success: boolean;
    message: string;
    leaderboard: Array<{
      rank: number;
      name: string;
      email: string;
      score: number;
      totalQuestions: number;
      percentage: string;
      timeTaken?: string | null;
      submittedAt?: string;
    }>;
    totalParticipants?: number;
    averageScore?: string;
    quiz_id?: string;
  }> {
    try {
      const response = await this.api.get(`/leaderboard/${quizId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch leaderboard');
      }

      // Transform the API response to match our UI requirements
      const leaderboard = response.data.leaderboard.map((entry: any, index: number) => ({
        rank: index + 1,
        name: entry.name,
        email: entry.userEmail,
        score: parseInt(entry.userScore, 10),
        totalQuestions: parseInt(entry.totalQuestions, 10),
        percentage: entry.percentage,
        // These fields are not provided by the API, so we'll leave them undefined
        timeTaken: undefined,
        submittedAt: undefined
      }));

      return {
        ...response.data,
        leaderboard
      };
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      throw error;
    }
  }

  public async fetchWorkspaceQuiz(workspaceId: string): Promise<{
    success: boolean;
    message: string;
    quiz: QuizData[];
  }> {
    try {
      const response = await this.api.get(`/workspaceQuiz/?workspace_id=${workspaceId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch workspace quiz');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch workspace quiz:', error);
      throw error;
    }
  }
}
export default QuizService.getInstance();