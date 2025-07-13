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
  duration?: number; // Total duration in seconds
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

interface SubmitQuizAnswersParams {
  answers: Array<{
    questionId: number;
    answerId: string;
  }>;
}

interface SubmitQuizResponse {
  success: boolean;
  score: number;
  total: number;
  correctAnswers: number;
  incorrectAnswers: number;
  percentage: number;
  results: Array<{
    questionId: number;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
}

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
        duration: params.duration // Add duration to the request
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

  public async submitQuizAnswers(quizId: string, params: SubmitQuizAnswersParams): Promise<SubmitQuizResponse> {
    try {
      const response = await this.api.post<SubmitQuizResponse>(`/quizzes/${quizId}/submit`, params);
      if (!response.data.success) {
        throw new Error('Failed to submit quiz answers');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to submit quiz answers:', error);
      throw error;
    }
  }
}

export default QuizService.getInstance();
