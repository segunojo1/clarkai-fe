"use client"

import { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

// Initialize pdf worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

type PDFFile = string | File | Blob | ArrayBuffer | null;

interface PDFViewerProps {
  file: PDFFile;
  onClose: () => void;
}

export function PDFViewer({ file, onClose }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Create a stable file reference
  const fileRef = useRef<PDFFile>(null);
  const [fileKey, setFileKey] = useState(0);

  useEffect(() => {
    // Only process if file has changed
    if (file === fileRef.current) return;
    
    fileRef.current = file;
    
    if (!file) {
      setPdfUrl('');
      setIsLoading(false);
      return;
    }

    let objectUrl: string | null = null;
    let isMounted = true;

    const processFile = async () => {
      try {
        setIsLoading(true);
        
        if (typeof file === 'string') {
          // Handle URL string
          if (isMounted) {
            setPdfUrl(file);
            setFileKey(prev => prev + 1); // Force re-render with new file
          }
        } else if (file instanceof File || file instanceof Blob) {
          // Handle File or Blob objects
          objectUrl = URL.createObjectURL(file);
          if (isMounted) {
            setPdfUrl(objectUrl);
            setFileKey(prev => prev + 1); // Force re-render with new file
          }
        } else if (file && typeof file === 'object' && 'url' in file) {
          // Handle objects with a url property
          if (isMounted) {
            setPdfUrl((file as any).url);
            setFileKey(prev => prev + 1); // Force re-render with new file
          }
        } else {
          console.warn('Unsupported file type:', file);
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
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const goToPrevPage = () => {
    setPageNumber(prevPage => Math.max(prevPage - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prevPage => Math.min(prevPage + 1, numPages));
  };

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
        className="h-full w-full max-w-[60%] bg-white dark:bg-gray-900 overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium">PDF Viewer</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <Document
            file={pdfUrl}
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
              width={600}
              className="border border-gray-200 dark:border-gray-700"
              loading={
                <div className="flex justify-center items-center h-64">
                  <p>Loading page {pageNumber}...</p>
                </div>
              }
            />
          </Document>

          <div className="mt-4 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={pageNumber}
                onChange={handlePageChange}
                min={1}
                max={numPages}
                className="w-16 text-center"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                / {nu