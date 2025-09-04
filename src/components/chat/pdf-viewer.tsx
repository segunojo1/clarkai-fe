"use client";

import { useEffect, useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from "framer-motion";
import ThemeSwitcher from '../theme-switcher';
import UserAvatar from '../user-avatar';
import { useChatStore } from '@/store/chat.store';
import { ChatMessageList } from './message-list';
import { useParams } from 'next/navigation';
import ChatInputForm2 from '../home/small-chat-input-form';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type PDFFile = string | File | Blob | ArrayBuffer | null;

interface PDFViewerProps {
  file: PDFFile;
  onClose: () => void;
}

export function PDFViewer({ file, onClose }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isPDFLoading, setIsPDFLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const fileRef = useRef<PDFFile>(null);
  const [fileKey, setFileKey] = useState(0);
  const { id } = useParams();


  useEffect(() => {
    if (file === fileRef.current) return;
    fileRef.current = file;
    setIsPDFLoading(true);
    setError(null);

    if (!file) {
      setIsPDFLoading(false);
      return;
    }

    setFileKey(prev => prev + 1);
    setIsPDFLoading(false);
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsPDFLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    setError('Failed to load PDF. Please try again.');
    setIsPDFLoading(false);
  };

  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages));

  const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPage = parseInt(e.target.value, 10);
    if (!isNaN(newPage)) {
      setPageNumber(Math.min(Math.max(newPage, 1), numPages));
    }
  };

  const handleZoomLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const zoom = parseInt(e.target.value, 10);
    if (!isNaN(zoom)) {
      setZoomLevel(Math.min(Math.max(zoom, 10), 200));
    }
  };

  const { messages, sendMessage, chatDetails, setIsLoading, isLoading } = useChatStore()
  console.log(chatDetails);

  const handleSend = async (text: string, files?: any) => {
    if (!text.trim()) return
    if (id) {

      await sendMessage(id.toString(), text, messages, true, files)
    }
  }

  if (!file) return null;

  if (isPDFLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
          <p>Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
          <p className="text-red-500">{error}</p>
          <Button onClick={onClose} className="mt-4">Close</Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ x: 999 }}
      animate={{ x: 0 }}
      exit={{ x: 999 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm"

    >
      <div className='w-[60%] bg-[#F8F8F7] dark:bg-[#262626] h-full'>

        <div className="sticky top-0 z-10 bg-[#F8F8F7] dark:bg-[#2C2C2C] p-4 py-[18px] border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">

          <UserAvatar />
          <p className='text-[18px] font-bold'>{chatDetails?.chat.name}</p>
        </div>

        <div className="flex flex-col w-full justify-between  pb-20 mx-auto h-full">
          {messages.length === 0 ? (
            <p>chat</p>
          ) : (
            <ChatMessageList messages={messages} isLoading={isLoading} className='!h-[calc(100vh-270px)] !w-fit' />
          )}
          <ChatInputForm2 onSend={handleSend} disabled={isLoading} />
        </div>
      </div>
      <div
        className="h-full w-full max-w-[70%] bg-[#F8F8F7] dark:bg-[#2C2C2C] overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#F8F8F7] dark:bg-[#2C2C2C] p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className='flex gap-2 items-center'>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
            <h3 className="text-[14px] font-bold">
              {file instanceof File ? file.name : "PDF Document"}
            </h3>
          </div>

          {numPages > 1 && (
            <div className="flex items-center justify-between p-2 border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min={1}
                  max={numPages}
                  value={pageNumber}
                  onChange={handlePageChange}
                  className="w-16 text-center h-8"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  of {numPages}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextPage}
                disabled={pageNumber >= numPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Input
              type="number"
              min={10}
              max={200}
              value={zoomLevel}
              onChange={handleZoomLevelChange}
              className="w-16 text-center h-8"
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">%</span>
          </div>

          <ThemeSwitcher />
        </div>

        <div className='p-7'>
          <div
            className="flex-1 p-4 overflow-auto border-[20px] rounded-[10px] border-[#F0F0EF] dark:border-[#404040]"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: '0 0'
            }}
          >
            <Document
              key={`pdf-doc-${fileKey}`}
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              className="flex justify-center"
              loading={
                <div className="flex justify-center items-center h-64">
                  <p>Loading PDF...</p>
                </div>
              }
              error={
                <div className="text-red-500 p-4">
                  Failed to load PDF. Please try again.
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                width={800}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="border border-gray-200 dark:border-gray-700"
                loading={
                  <div className="flex justify-center items-center h-64">
                    <p>Loading page {pageNumber}...</p>
                  </div>
                }
              />

              {/* <Canvas
                pageNumber={pageNumber}
                width={800}
                className="border border-gray-200 dark:border-gray-700 mt-4"
                loading={
                  <div className="flex justify-center items-center h-64">
                    <p>Rendering canvas for page {pageNumber}...</p>
                  </div>
                }
              /> */}
            </Document>
          </div>
        </div>
      </div>
    </motion.div>
  );
}