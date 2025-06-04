"use client"

import { useEffect, useState, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Initialize pdf worker with a CDN that supports CORS
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import type { FileAttachment } from '@/lib/types';

type PDFFile = string | File | Blob | ArrayBuffer | FileAttachment | null;

interface PDFViewerProps {
  file: PDFFile;
  onClose: () => void;
}

export function PDFViewer({ file, onClose }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const fileRef = useRef<PDFFile>(null);
  const [fileKey, setFileKey] = useState(0);

  // Helper function to get a usable URL from different file types
  const getFileUrl = useCallback(async (file: PDFFile): Promise<string | null> => {
    if (!file) return null;

    try {
      // If it's already a URL string, use it directly
      if (typeof file === 'string') {
        console.log('string');
        
        return file;
      }
      
      // If it's a File or Blob, create an object URL
      if (file instanceof File || file instanceof Blob) {
        console.log('fil or blob');
        
        return URL.createObjectURL(file);
      }
      
      // If it's a FileAttachment with a URL
      if ('url' in file && file.url) {
        console.log(' url');

        return file.url;
      }
      
      // If it's a FileAttachment with data
      if ('type' in file) {
        console.log('type');

        const blob = new Blob([], { type: file.type });
        return URL.createObjectURL(blob);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  }, []);

  // Store the created object URL for cleanup
  const objectUrlRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Only process if file has changed
    if (file === fileRef.current) return;
    
    fileRef.current = file;
    
    // Clean up previous object URL if it exists
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    
    if (!file) {
      setPdfUrl('');
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const processFile = async () => {
      try {
        setIsLoading(true);
        
        // Get the URL for the file
        const url = URL.createObjectURL(file as Blob);
        
        if (!isMounted) return;
        
        if (url) {
          // If we created an object URL, store it for cleanup
          if (url.startsWith('blob:')) {
            objectUrlRef.current = url;
          }
          setPdfUrl(url);
          setFileKey(prev => prev + 1);
        } else {
          console.warn('Could not create URL for file:', file);
          setPdfUrl('');
        }
      } catch (error) {
        console.error('Error processing PDF:', error);
        if (isMounted) {
          setPdfUrl('');
          setFileKey(prev => prev + 1);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    processFile();

    return () => {
      isMounted = false;
    };
  }, [file, getFileUrl]);
  
  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log(numPages);
    
    setNumPages(numPages);
    setPageNumber(1);
  };

  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages));

  const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPage = parseInt(e.target.value, 10);
    if (!isNaN(newPage) && newPage >= 1 && newPage <= numPages) {
      setPageNumber(newPage);
    }
  };

  if (!file) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
          <p>Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
          <p>No PDF file available</p>
          <Button onClick={onClose} className="mt-4">Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm" 
      onClick={onClose}
    >
      <div 
        className="h-full w-full max-w-[60%] bg-white dark:bg-gray-900 overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium">PDF Viewer</h3>
          <Button 
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        {/* Page Navigation */}
        {numPages > 1 && (
          <div className="flex items-center justify-between p-2 border-b bg-gray-50 dark:bg-gray-800">
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
              <span className="text-sm text-gray-600 dark:text-gray-300">/ {numPages}</span>
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
        
        {/* PDF Content */}
        <div className="flex-1 p-4 overflow-auto">
          <Document
            key={`pdf-doc-${fileKey}`}
            file={URL.createObjectURL(file as Blob)}
            onLoadSuccess={onDocumentLoadSuccess}
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
          </Document>
        </div>
      </div>
    </div>
  );
}
