"use client"

import { useState } from "react"
import { X, Edit } from "lucide-react"
import { useWorkspaceStore } from "@/store/workspace.store"
import quizService from "@/services/quiz.service"
import { toast } from "sonner"
import Link from "next/link"

interface SlidingPanelProps {
    isOpen: boolean
    onClose: () => void
    workspaceId: string
}

interface QuizFormData {
    step1: {
        topic: string
        materialId: string
        quizType: string
        isTimed: string
        timePerQuestion: number
    }
    step2: {
        numQuestions: number
        difficulty: string
        focusArea: string
    }
    step3: {
        source: string
        questionType: string
        numQuestions: number
        timeLimit: number
        focusArea: string
    }
}

export function SlidingPanel({ isOpen, onClose, workspaceId }: SlidingPanelProps) {
    const [currentStep, setCurrentStep] = useState(1)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedQuiz, setGeneratedQuiz] = useState<{ id: string } | null>(null)
    const [formData, setFormData] = useState<QuizFormData>({
        step1: {
            topic: '',
            materialId: 'all',
            quizType: 'mcq',
            isTimed: 'no',
            timePerQuestion: 30
        },
        step2: {
            numQuestions: 5,
            difficulty: 'Easy',
            focusArea: ''
        },
        step3: {
            source: 'all',
            questionType: 'mcq',
            numQuestions: 5,
            timeLimit: 30,
            focusArea: ''
        }
    })

    const { selectedWorkspace } = useWorkspaceStore()

    interface WorkspaceFile {
        id: string;
        filePath: string;
        fileName: string;
        size: string;
    }

    interface WorkspaceWithFiles {
        workspace: {
            files: {
                pdfFiles: WorkspaceFile[];
            };
        };
    }

    const materials = [
        { id: 'all', name: 'All Materials' },
        ...((selectedWorkspace as WorkspaceWithFiles)?.workspace?.files?.pdfFiles?.map((file: WorkspaceFile) => ({
            id: file.id,
            name: file.fileName
        })) || [])
    ]

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const [step, field] = name.split('.');

        setFormData(prev => {
            const newFormData = {
                ...prev,
                [step]: {
                    ...prev[step as keyof typeof prev],
                    [field]: type === 'number' ? Number(value) : value
                }
            };

            // If changing quiz type in step 1, update step 3 if it exists
            if (step === 'step1' && field === 'quizType' && currentStep >= 3) {
                newFormData.step3.questionType = value;
            }

            // If changing number of questions in step 2, update step 3 if it exists
            if (step === 'step2' && field === 'numQuestions' && currentStep >= 3) {
                newFormData.step3.numQuestions = Number(value);
            }

            // If changing material in step 1, update step 3 source if it exists
            if (step === 'step1' && field === 'materialId' && currentStep >= 3) {
                newFormData.step3.source = value;
            }

            return newFormData;
        });
    }

    const handleNext = () => {
        if (currentStep === 1) {
            // When moving from step 1 to 2, initialize step2 values
            setFormData(prev => ({
                ...prev,
                step2: {
                    ...prev.step2,
                    numQuestions: prev.step2.numQuestions || 5,
                    difficulty: prev.step2.difficulty || 'Easy'
                }
            }));
        } else if (currentStep === 2) {
            // When moving from step 2 to 3, initialize step3 values with step2 values
            setFormData(prev => ({
                ...prev,
                step3: {
                    source: prev.step1.materialId || 'all',
                    questionType: prev.step1.quizType || 'mcq',
                    numQuestions: prev.step2.numQuestions || 5,
                    timeLimit: prev.step1.isTimed === 'yes' ? Number(prev.step1.timePerQuestion) : 30,
                    focusArea: prev.step2.focusArea || ''
                }
            }));
        }

        if (currentStep <= 2) {
            setCurrentStep(currentStep + 1);
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Move to loading state (case 4) immediately
        setCurrentStep(4);
        
        try {
            // Use the most specific values (from step3 if available, otherwise from previous steps)
            const quizName = formData.step1.topic || 'New Quiz';
            const numQuestions = formData.step3.numQuestions || formData.step2.numQuestions || 5;
            const difficulty = formData.step2.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard';
            const isTimed = formData.step1.isTimed === 'yes';
            const duration = isTimed ? Number(formData.step1.timePerQuestion) : undefined;

            // Determine mode and file ID
            const source = formData.step3.source || formData.step1.materialId || 'all';
            const isWorkspaceMode = source === 'all';
            const mode = isWorkspaceMode ? 'workspace' as const : 'file' as const;
            const fileId = !isWorkspaceMode ? source : undefined;

            console.log('Generating quiz with params:', {
                workspace_id: workspaceId,
                size: numQuestions,
                name: quizName,
                mode,
                file_id: fileId,
                difficulty,
                duration
            });

            // Run the quiz generation in the background
            const response = await quizService.generateQuiz({
                workspace_id: workspaceId,
                size: numQuestions,
                name: quizName,
                mode,
                file_id: fileId,
                difficulty,
                duration
            });

            console.log('Quiz generated successfully:', response);
            setGeneratedQuiz({ id: response.quiz_id });
            setCurrentStep(5); // Move to success step (case 5)
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error('An unknown error occurred');
            console.error('Error generating quiz:', error);
            setCurrentStep(3); // Go back to the form if there's an error
        } finally {
            setIsGenerating(false);
        }
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="p-4">
                        <h3 className="text-3xl font-bold text-white mb-6">Let&apos;s Build a Quiz!</h3>
                        <form onSubmit={handleSubmit} className="space-y-3 w-[341px]">
                            {/* Step 1 form content remains unchanged */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-[5px]">
                                    Enter a Topic
                                </label>
                                <input
                                    type="text"
                                    name="step1.topic"
                                    value={formData.step1.topic}
                                    onChange={handleInputChange}
                                    placeholder="E.g., Machine Learning, Calculus, World War II"
                                    className="w-full bg-[#232323] border border-[#333] rounded-lg p-3 text-white text-sm focus:border-[#FF3D00] focus:ring-1 focus:ring-[#FF3D00]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-[5px]">
                                    Where should we pull questions from?
                                </label>
                                <select
                                    name="step1.materialId"
                                    value={formData.step1.materialId}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#232323] border border-[#333] rounded-lg p-3 text-white text-sm focus:border-[#FF3D00] focus:ring-1 focus:ring-[#FF3D00]"
                                >
                                    {materials.map(material => (
                                        <option key={material.id} value={material.id}>
                                            {material.id === 'all' ? 'All Materials (Workspace)' : material.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-[5px]">
                                    How do you want the quiz to be structured?
                                </label>
                                <select
                                    name="step1.quizType"
                                    value={formData.step1.quizType}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#232323] border border-[#333] rounded-lg p-3 text-white text-sm focus:border-[#FF3D00] focus:ring-1 focus:ring-[#FF3D00] mb-4"
                                >
                                    <option value="mcq">Multiple Choice Questions</option>
                                    <option value="true_false">True/False</option>
                                    <option value="short_answer">Short Answer</option>
                                    <option value="mixed">Mixed</option>
                                </select>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-300">Timed Quiz?</span>
                                    <div className="flex items-center space-x-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="step1.isTimed"
                                                value="yes"
                                                checked={formData.step1.isTimed === 'yes'}
                                                onChange={handleInputChange}
                                                className="text-[#FF3D00] focus:ring-[#FF3D00]"
                                            />
                                            <span className="ml-2 text-sm">Yes</span>
                                        </label>
                                        <label className="inline-flex items-center ml-4">
                                            <input
                                                type="radio"
                                                name="step1.isTimed"
                                                value="no"
                                                checked={formData.step1.isTimed === 'no'}
                                                onChange={handleInputChange}
                                                className="text-[#FF3D00] focus:ring-[#FF3D00]"
                                            />
                                            <span className="ml-2 text-sm">No</span>
                                        </label>
                                    </div>
                                </div>

                                {formData.step1.isTimed === 'yes' && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Total quiz duration (minutes)
                                        </label>
                                        <input
                                            type="number"
                                            name="step1.timePerQuestion"
                                            value={formData.step1.timePerQuestion}
                                            onChange={handleInputChange}
                                            min="1"
                                            className="w-full bg-[#232323] border border-[#333] rounded-lg p-2 text-white text-sm focus:border-[#FF3D00] focus:ring-1 focus:ring-[#FF3D00]"
                                        />
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={handleNext}
                                className="w-full py-3 bg-[#FF3D00] hover:bg-[#FF3D00]/90 text-white font-medium rounded-lg transition-colors"
                            >
                                Continue
                            </button>
                        </form>
                    </div>
                )
            case 2:
                return (
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={handleBack}
                                className="flex items-center text-gray-400 p-2 hover:bg-[#232323] rounded-full  hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                </svg>
                            </button>
                        </div>

                        <h3 className="text-3xl font-bold text-white mb-8">Customize your quiz experience.</h3>

                        <form onSubmit={handleSubmit} className="space-y-3 w-[341px]">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Number of Questions
                                </label>
                                <input
                                    type="number"
                                    name="step2.numQuestions"
                                    value={formData.step2.numQuestions}
                                    onChange={handleInputChange}
                                    min="5"
                                    max="30"
                                    className="w-full bg-[#232323] border border-[#333] rounded-lg p-3 text-white text-sm focus:border-[#FF3D00] focus:ring-1 focus:ring-[#FF3D00]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Difficulty
                                </label>
                                <select
                                    name="step2.difficulty"
                                    value={formData.step2.difficulty}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#232323] border border-[#333] rounded-lg p-3 text-white text-sm focus:border-[#FF3D00] focus:ring-1 focus:ring-[#FF3D00]"
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Focus Area
                                </label>
                                <select
                                    name="step2.focusArea"
                                    value={formData.step2.focusArea}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#232323] border border-[#333] rounded-lg p-3 text-white text-sm focus:border-[#FF3D00] focus:ring-1 focus:ring-[#FF3D00]"
                                >
                                    <option value="">If material is selected, select the focus</option>
                                    <option value="concepts">Key Concepts</option>
                                    <option value="examples">Examples & Applications</option>
                                    <option value="theorems">Theorems & Proofs</option>
                                </select>
                            </div>

                            <div className="border-t border-[#333] pt-4">
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="w-full py-3 bg-[#FF3D00] hover:bg-[#FF3D00]/90 text-white font-medium rounded-lg transition-colors"
                                >
                                    Continue
                                </button>
                            </div>
                        </form>
                    </div>
                )
            case 3:
                return (
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={handleBack}
                                className="flex items-center text-gray-400 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                </svg>
                                Back
                            </button>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-[#232323] rounded-full transition-colors"
                                >
                                    <X className="h-4 w-4 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Ready to quiz?</h3>
                                <p className="text-gray-400 text-sm">All done...</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    {/* Preview of selected options */}
                                    <div className="bg-[#1E1E1E] p-4 rounded-lg border border-[#333]">
                                        <h4 className="text-[#FF3D00] text-sm font-medium mb-3">Quiz Preview</h4>

                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Source:</span>
                                                <span className="text-white">
                                                    {formData.step3.source === 'all'
                                                        ? 'All Materials'
                                                        : materials.find(m => m.id === formData.step3.source)?.name || 'N/A'}
                                                </span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Question Type:</span>
                                                <span className="text-white capitalize">
                                                    {formData.step3.questionType === 'mcq' ? 'Multiple Choice' :
                                                        formData.step3.questionType === 'true_false' ? 'True/False' :
                                                            formData.step3.questionType === 'short_answer' ? 'Short Answer' :
                                                                formData.step3.questionType === 'mixed' ? 'Mixed' : 'N/A'}
                                                </span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Number of Questions:</span>
                                                <span className="text-white">{formData.step3.numQuestions}</span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Total Time:</span>
                                                <span className="text-white">
                                                    {formData.step1.isTimed === 'yes'
                                                        ? `${formData.step1.timePerQuestion} seconds`
                                                        : 'No time limit'}
                                                </span>
                                            </div>

                                            {formData.step3.focusArea && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Focus Area:</span>
                                                    <span className="text-white capitalize">
                                                        {formData.step3.focusArea === 'concepts' ? 'Key Concepts' :
                                                            formData.step3.focusArea === 'examples' ? 'Examples & Applications' :
                                                                formData.step3.focusArea === 'theorems' ? 'Theorems & Proofs' : ''}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Difficulty:</span>
                                                <span className="text-white capitalize">{formData.step2.difficulty.toLowerCase()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-400 text-center py-2">
                                        Review your quiz settings. Click &quot;Generate Quiz&quot; to create your quiz.
                                    </div>
                                </div>

                                <div className="border-t border-[#333] pt-6">
                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-[#FF3D00] hover:bg-[#FF3D00]/90 text-white font-bold uppercase rounded-lg transition-colors flex items-center justify-center space-x-2"
                                        disabled={isGenerating}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Generating...
                                            </>
                                        ) : 'Generate Quiz'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="w-full mt-3 py-2 text-gray-400 hover:text-white text-sm font-medium"
                                    >
                                        Back to Edit
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>)
            case 4:
                return (
                    <div className="p-6 flex flex-col items-center justify-center h-full">
                        <Edit />
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF3D00] mb-4"></div>
                        <h3 className="text-xl font-bold text-white mb-2">Assembling questions...</h3>
                        <p className="text-gray-400 text-center">Please wait while we prepare your quiz. This may take a moment.</p>
                    </div>
                )
            case 5:
                return (
                    <div className="p-6 text-white max-w-[440px] mx-auto">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold mb-2">Quiz Generated!</h2>
                            <p className="text-gray-400">
                                Your quiz is ready to go. You can start now,
                                <span
                                    className="underline cursor-pointer hover:text-white"
                                    onClick={() => {
                                        // TODO: Implement preview functionality
                                        toast('Preview coming soon!');
                                    }}
                                >
                                    review the questions
                                </span>, or
                                <span
                                    className="underline cursor-pointer hover:text-white"
                                    onClick={async () => {
                                        try {
                                            const quizUrl = `${window.location.origin}/quiz/${generatedQuiz?.id}`;
                                            await navigator.clipboard.writeText(quizUrl);
                                            toast('Quiz link copied to clipboard!');
                                        } catch (error) {
                                            console.error('Failed to copy:', error);
                                            toast('Failed to copy quiz link');
                                        }
                                    }}
                                >
                                    share it
                                </span> with friends or a study group.
                            </p>
                        </div>

                        {/* Divider */}
                        <hr className="border-gray-700 my-6" />

                        {/* Quiz Metadata */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold">
                                    {formData.step1.topic || 'Untitled Quiz'}
                                </h3>
                                <button
                                    className="text-gray-400 hover:text-white"
                                    onClick={() => {
                                        // TODO: Implement edit quiz functionality
                                        toast('Edit quiz coming soon!');
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </button>
                            </div>

                            <ul className="space-y-4">
                                <li className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2 text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Source:</span>
                                        <span className="text-white">
                                            {formData.step3.source === 'all'
                                                ? 'All Materials'
                                                : materials.find(m => m.id === formData.step3.source)?.name || 'Unknown'}
                                        </span>
                                    </div>
                                    <button
                                        className="text-gray-400 hover:text-white"
                                        onClick={() => {
                                            const source = formData.step3.source === 'all'
                                                ? 'All materials in the workspace'
                                                : materials.find(m => m.id === formData.step3.source)?.name || 'Unknown';
                                            toast.info(`Source: ${source}`);
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </li>

                                <li className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2 text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                        </svg>
                                        <span>Created:</span>
                                        <span className="text-white">
                                            {new Date().toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <button
                                        className="text-gray-400 hover:text-white"
                                        onClick={() => {
                                            // TODO: Implement refresh functionality
                                            toast('Refreshing...');
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </li>

                                <li className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2 text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 10.414V14a1 1 0 102 0v-3.586l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                                        </svg>
                                        <span>Status:</span>
                                        <span className="text-white">Ready to start</span>
                                    </div>
                                    <button
                                        className="text-gray-400 hover:text-white"
                                        onClick={() => {
                                            // TODO: Implement delete functionality
                                            toast.info('Delete quiz coming soon!');
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col space-y-2">
                            <Link href={`/quiz/${generatedQuiz?.id}`}
                                className="flex items-center justify-center py-3 bg-[#FF3D00] hover:bg-[#FF3D00]/90 text-white font-medium rounded-lg transition-colors"
                            >
                                Start Quiz
                            </Link>

                            <button
                                onClick={async () => {
                                    if (generatedQuiz?.id) {
                                        const quizUrl = `${window.location.origin}/quiz/${generatedQuiz.id}`;
                                        try {
                                            if (navigator.share) {
                                                await navigator.share({
                                                    title: formData.step1.topic || 'Quiz',
                                                    text: `Check out this quiz: ${formData.step1.topic || 'Untitled Quiz'}`,
                                                    url: quizUrl,
                                                });
                                            } else {
                                                await navigator.clipboard.writeText(quizUrl);
                                                toast.success('Quiz link copied to clipboard!');
                                            }
                                        } catch (error) {
                                            console.error('Error sharing:', error);
                                            if (error.name !== 'AbortError') {
                                                await navigator.clipboard.writeText(quizUrl);
                                                toast.success('Link copied to clipboard!');
                                            }
                                        }
                                    } else {
                                        toast.error('Quiz ID not found');
                                    }
                                }}
                                className="flex-1 py-3 border border-gray-600 text-white bg-transparent hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                </svg>
                                Share Quiz
                            </button>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className={`h-full w-[540px] bg-[#2C2C2C] z-[9999999] border-l border-[#333] transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-4 border-b border-[#333]">
                    <h2 className="text-lg font-medium text-white">Create Quiz</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#232323] rounded-full transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-400" />
                        <span className="sr-only">Close</span>
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 satoshi">
                    {renderStepContent()}
                </div>
            </div>
        </div>
    )
}
