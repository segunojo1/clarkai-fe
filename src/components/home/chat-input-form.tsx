"use client"

import { FormField, FormItem, FormControl, Form } from "@/components/ui/form"
import { chatSchema } from "@/models/validations/chat.validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react"
import { useForm } from 'react-hook-form';
import { z } from "zod"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { X, FileText, MicOff } from "lucide-react"
import { useChatStore } from "@/store/chat.store"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import Image from "next/image"
import { ArrowUp, Loader } from "lucide-react"
import { FormMessage } from "../ui/form"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "../ui/command"

declare global {
  interface SpeechRecognitionEvent extends Event {
    results: {
      [index: number]: {
        [index: number]: {
          transcript: string;
          confidence: number;
        };
      };
      isFinal: boolean;
    }[];
    resultIndex: number;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
    onnomatch: ((this: SpeechRecognition, ev: Event) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    abort(): void;
    start(): void;
    stop(): void;
  }

  declare var webkitSpeechRecognition: {
    prototype: SpeechRecognition;
    new (): SpeechRecognition;
  };

  interface Window {
    webkitSpeechRecognition: typeof webkitSpeechRecognition;
    SpeechRecognition: typeof webkitSpeechRecognition;
  }
}

const TAGS = [
  { value: 'flashcard', label: 'flashcard' },
  { value: 'material', label: 'material' },
  { value: 'summary', label: 'summary' },
  { value: 'quiz', label: 'quiz' },
  { value: 'important', label: 'important' },
]

interface ChatInputFormProps {
  onSend: (message: string, file?: File) => void;
  disabled?: boolean;
  onGenerateFlashcards?: (context: string) => Promise<void>;
}

const ChatInputForm = ({
  onSend,
  disabled,
  onGenerateFlashcards
}: ChatInputFormProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [mode, setMode] = useState<'ask' | 'research' | 'create'>('ask')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(false)
  const [isListening, setIsListening] = useState<boolean>(false)
  const [volume, setVolume] = useState<number>(0)
  const [interimTranscript, setInterimTranscript] = useState<string>('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [tagSearch, setTagSearch] = useState('')
  const [tagPosition, setTagPosition] = useState({ top: 0, left: 0, show: false })
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Filter tags based on search input
  const filteredTags = TAGS.filter(tag => 
    tag.label.toLowerCase().includes(tagSearch.toLowerCase())
  )

  const handleTagSelect = (tag: string) => {
    setTagPosition(prev => ({ ...prev, show: false }))
    if (!textareaRef.current) return
    
    const textarea = textareaRef.current
    const startPos = textarea.selectionStart || 0
    const text = textarea.value || ''
    const textBeforeCursor = text.substring(0, startPos)
    const lastAtPos = textBeforeCursor.lastIndexOf('@')
    
    if (lastAtPos >= 0) {
      let newText = text.substring(0, lastAtPos) + `@${tag}`
      
      // Add a space after the tag if it's not the end of the text
      if (startPos < text.length || tag === 'flashcard') {
        newText += ' '
      }
      
      newText += text.substring(startPos)
      form.setValue('chat', newText, { shouldValidate: true })
      
      // Move cursor to after the inserted tag
      setTimeout(() => {
        const newCursorPos = lastAtPos + tag.length + 2 // +2 for @ and space
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
    }
    
    setShowTagSuggestions(false)
  }

  // Check for speech recognition support after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSpeechSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    }
  }, [])

  const form = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
    defaultValues: {
      chat: "",
    },
  })

  const { isLoading } = useChatStore()

  const toggleListening = () => {
    if (typeof window === 'undefined') {
      toast.error('Speech recognition is not available')
      return
    }

    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        setInterimTranscript('')
      }
      setIsListening(false)
    } else {
      // Start listening
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        toast.error('Speech recognition is not supported in your browser')
        return
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      
      // Add event listener for volume/sound detection
      if (typeof window !== 'undefined' && 'webkitAudioContext' in window) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
          .then((stream) => {
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            
            const updateVolume = () => {
              if (!isListening) return;
              analyser.getByteFrequencyData(dataArray);
              const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
              setVolume(Math.min(100, average * 0.5)); // Scale and cap the volume
              requestAnimationFrame(updateVolume);
            };
            updateVolume();
          })
          .catch((error) => {
            console.error('Error accessing microphone:', error);
          });
      }

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          form.setValue('chat', form.getValues('chat') + finalTranscript, { shouldValidate: true });
        }
        setInterimTranscript(interimTranscript);
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error)
        toast.error('Error occurred in speech recognition')
        setIsListening(false)
        setInterimTranscript('')
      }

      recognition.onend = () => {
        setIsListening(false)
        
      }

      try {
        recognition.start()
        setIsListening(true)
        recognitionRef.current = recognition
      } catch (error) {
        console.error('Speech recognition start failed:', error)
        toast.error('Failed to start speech recognition')
      }
    }
  }

  const handleSubmit = async (values: z.infer<typeof chatSchema>) => {
    setTagPosition(prev => ({ ...prev, show: false }));
    if (!values.chat.trim() && !selectedFile) return;

    try {
      const messageText = values.chat.trim();
      const hasFlashcardTag = messageText.includes('@flashcard');
      
      if (hasFlashcardTag && onGenerateFlashcards) {
        // Only call generateFlashcards, not onSend
        const context = messageText.replace(/@flashcard\s*/g, '').trim();
        if (context) {
          await onGenerateFlashcards(context);
        }
      } else {
        // Regular message sending
        onSend(messageText, selectedFile || undefined);
      }
      
      form.reset();
      setSelectedFile(null);
      setPreviewUrl('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are supported')
      return
    }

    setSelectedFile(file)

    setPreviewUrl(URL.createObjectURL(file))
  }

  const removeFile = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.target as HTMLTextAreaElement
    const cursorPosition = textarea.selectionStart ?? 0
    const textBeforeCursor = textarea.value.substring(0, cursorPosition)
    const lastAtPos = textBeforeCursor.lastIndexOf('@')
    
    // Close suggestions when backspacing past @
    if (e.key === 'Backspace' && textBeforeCursor.endsWith('@') && showTagSuggestions) {
      setShowTagSuggestions(false)
      setTagPosition(prev => ({ ...prev, show: false }))
      return
    }
    
    // Check if @ was just typed or if we're in the middle of a tag
    if (lastAtPos >= 0 && (textBeforeCursor.length === lastAtPos + 1 || /^[a-zA-Z0-9_]*$/.test(textBeforeCursor.substring(lastAtPos + 1)))) {
      const rect = textarea.getBoundingClientRect()
      const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight, 10) || 20
      const lines = textBeforeCursor.substring(0, cursorPosition).split('\n')
      const currentLine = lines[lines.length - 1] ?? ''
      const lineNumber = lines.length
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      setTagPosition({
        top: rect.top + scrollTop + (lineNumber * lineHeight) + 10,
        left: rect.left + scrollLeft + (currentLine.length * 8), // Approximate character width
        show: true
      })
      
      setTagSearch(textBeforeCursor.substring(lastAtPos + 1))
      setShowTagSuggestions(true)
    } else {
      setShowTagSuggestions(false)
      setTagPosition(prev => ({ ...prev, show: false }))
    }

    // Handle Enter key
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (showTagSuggestions) {
        // If suggestions are open, don't submit the form
        return
      }
      void form.handleSubmit(handleSubmit)()
    }
    
    // Close suggestions on Escape
    if (e.key === 'Escape' && showTagSuggestions) {
      e.preventDefault()
      setShowTagSuggestions(false)
      setTagPosition(prev => ({ ...prev, show: false }))
    }
  };

  const renderTextWithTags = (text: string) => {
    if (!text) return null
    
    const parts: JSX.Element[] = []
    let lastIndex = 0
    const regex = /@(\w+)/g
    let match
    
    // If there's no @ symbol, return null to use the default text
    if (text.indexOf('@') === -1) return null
    
    while ((match = regex.exec(text)) !== null) {
      // Add text before the tag
      if (match.index > lastIndex) {
        parts.push(<span key={lastIndex}>{text.substring(lastIndex, match.index)}</span>)
      }
      
      // Add the tag with special styling
      const tag = match[1]
      const isTagValid = TAGS.some(t => t.value === tag)
      parts.push(
        <span 
          key={match.index} 
          className={cn(
            'font-medium',
            isTagValid ? 'text-blue-500' : 'text-red-500'
          )}
        >
          @{tag}
        </span>
      )
      
      lastIndex = match.index + match[0].length
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(<span key={lastIndex}>{text.substring(lastIndex)}</span>)
    }
    
    return parts
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 w-full relative">
          {/* File preview section */}
          {(selectedFile || previewUrl) && (
            <div className="absolute -top-25 left-0 w-full max-w-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2C2C2C] rounded-lg p-3">
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {selectedFile?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {selectedFile?.size ? `${(selectedFile.size / 1024).toFixed(1)} KB` : ''}
                    </p>
                    <div className="mt-2">
                      <button
                        type="button"
                        className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                        onClick={() => {
                          if (selectedFile && typeof window !== 'undefined') {
                            window.open(previewUrl, '_blank')
                          }
                        }}
                      >
                        <span>Open in new tab</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-transparent"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="chat"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative border-[0.3px] border-[#D4D4D4] bg-white dark:bg-[#2C2C2C] rounded-[12px] overflow-hidden">
                    <div className="relative">

                      <div className="relative">
                        <Textarea
                          placeholder={
                            mode === 'ask'
                              ? "Ask anything… or type @ to see Clark's magic commands..."
                              : mode === 'research'
                                ? "Research a topic..."
                                : "Create something new..."
                          }
                          className="min-h-[100px] max-h-[180px] text-[16px] max-w-[750px] font-medium p-3 w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none resize-none relative z-20 bg-transparent"
                          {...field}
                          onKeyDown={handleKeyDown}
                          disabled={disabled || isLoading}
                          ref={textareaRef}
                          style={{
                            color: 'transparent',
                            caretColor: 'currentColor'
                          }}
                        />
                        <div 
                          className="absolute inset-0 pointer-events-none z-10 p-3 whitespace-pre-wrap break-words"
                          style={{
                            font: 'inherit',
                            lineHeight: '1.5',
                            minHeight: '100px',
                            maxHeight: '180px',
                            overflow: 'hidden',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            padding: '0.75rem',
                            margin: '1px',
                            pointerEvents: 'none',
                            color: 'inherit'
                          }}
                        >
                          {renderTextWithTags(field.value || '') || field.value || ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 border-t border-[#D4D4D4] bg-white dark:bg-[#2C2C2C]">
                        <Tabs
                          value={mode}
                          onValueChange={(value) => setMode(value as 'ask' | 'research' | 'create')}
                          className="flex-1"
                        >
                          <TabsList className="bg-[#F5F5F5] dark:bg-[#262626] rounded-[8px] p-0 py-5 px-2 h-8 justify-start gap-1 text-[12px]">
                            <TabsTrigger
                              value="ask"
                              className="data-[state=active]:bg-white py-4 data-[state=active]:shadow-none rounded-md px-4 h-full text-sm font-medium text-gray-600 data-[state=active]:text-[#FF3D00]"
                            >
                              Ask
                            </TabsTrigger>
                            <TabsTrigger
                              value="research"
                              className="data-[state=active]:bg-white data-[state=active]:shadow-none rounded-md px-4 py-4 h-full text-sm font-medium text-gray-600 data-[state=active]:text-[#FF3D00]"
                            >
                              Research
                            </TabsTrigger>
                            <TabsTrigger
                              value="create"
                              className="data-[state=active]:bg-white data-[state=active]:shadow-none rounded-md px-4 py-4 h-full text-sm font-medium text-gray-600 data-[state=active]:text-[#FF3D00]"
                            >
                              Create
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                        <div className="flex items-center gap-2">
                          <div>
                            <button
                              type="button"
                              onClick={triggerFileInput}
                              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                              aria-label="Attach file"
                            >
                              <Image 
                                src="/assets/file.svg" 
                                alt="" 
                                width={20} 
                                height={20} 
                                className="h-5 w-5 text-gray-500 hover:text-gray-700" 
                              />
                            </button>
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept="image/*,.pdf"
                              className="hidden"
                              aria-label="File input"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={toggleListening}
                            disabled={!isSpeechSupported}
                            className={`relative p-1.5 rounded-full transition-all duration-200 ${
                              isListening 
                                ? 'bg-red-100 text-red-500 animate-pulse' 
                                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700'
                            }`}
                            title={isListening ? 'Stop listening' : 'Start voice input'}
                            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                          >
                            {isListening ? (
                              <div className="relative">
                                <MicOff className="h-5 w-5" />
                                <div 
                                  className="absolute -inset-1 rounded-full bg-red-100 opacity-75"
                                  style={{
                                    transform: `scale(${1 + (volume / 200)})`,
                                    transition: 'transform 0.1s ease-out'
                                  }}
                                />
                              </div>
                            ) : (
                              <Image 
                                width={20} 
                                height={20} 
                                alt="" 
                                src="/assets/waveform.svg" 
                                className="h-5 w-5" 
                              />
                            )}
                          </button>
                          <Image 
                            src="/assets/at.svg" 
                            alt="" 
                            width={21} 
                            height={30} 
                            className="text-gray-500"
                            aria-hidden="true"
                          />
                          <Button
                            type="submit"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-[#FAFAFA] hover:bg-[#FF3D00]/90"
                            disabled={disabled || isLoading}
                            aria-label="Send message"
                          >
                            {isLoading ? (
                              <Loader className="h-4 w-4 text-[#0A0A0A] animate-spin" />
                            ) : (
                              <ArrowUp className="h-4 w-4 text-[#0A0A0A]" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      {tagPosition.show && (
                        <div 
                          className="fixed z-[100] w-48 bg-white dark:bg-gray-800 text-popover-foreground rounded-md border border-gray-200 dark:border-gray-700 shadow-lg p-1"
                          style={{
                            top: `${tagPosition.top}px`,
                            left: `${tagPosition.left}px`,
                            transform: 'translateY(5px)',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                          }}
                        >
                          <Command>
                            <CommandInput 
                              placeholder="Search tags..." 
                              value={tagSearch} 
                              onValueChange={setTagSearch} 
                              className="h-9"
                            />
                            <CommandEmpty>No tags found.</CommandEmpty>
                            <CommandGroup className="max-h-60 overflow-auto">
                              {filteredTags.map((tag) => (
                                <CommandItem
                                  key={tag.value}
                                  value={tag.value}
                                  onSelect={() => handleTagSelect(tag.value)}
                                  className="cursor-pointer px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
                                >
                                  <span>@{tag.label}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </div>
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  )
}

export default ChatInputForm