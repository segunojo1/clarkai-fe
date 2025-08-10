"use client"

import { useState, useRef, ChangeEvent } from 'react';
import { PictureInPicture2, UploadCloud } from "lucide-react";
import { Button } from "../ui/button";

// Utility function to convert file to data URL
const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
import authService, { SignupPayload } from "@/services/auth.service";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/auth.store';

interface AddProfileProps {
  onSuccess: () => void;
}

const AddProfile = ({ onSuccess }: AddProfileProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signupData = useAuthStore(state => state.signupData);
  const resetSignup = useAuthStore(state => state.resetSignup);
  const router = useRouter();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Please select a profile picture');
      return;
    }

    try {
      setIsLoading(true);
      
      const { currentStep: _, confirmPassword: __, otp: ___, emailVerified: ____, ...signupDataWithoutStep } = signupData;      
      // Ensure all required fields are present
      console.log(_, __, ___, ____);
      console.log(signupDataWithoutStep);
      
      if (!signupDataWithoutStep.name || !signupDataWithoutStep.email) {
        throw new Error('Missing required fields');
      }

      // Convert file to data URL if a file is selected
      let userImageUrl = '';
      if (selectedFile) {
        userImageUrl = await fileToDataUrl(selectedFile);
      }

      // Create the payload with all required fields
      const payload: SignupPayload = {
        name: signupDataWithoutStep.name || '',
        email: signupDataWithoutStep.email || '',
        nickname: signupDataWithoutStep.nickname || '',
        password: signupDataWithoutStep.password || '',
        role: signupDataWithoutStep.role || 'student',
        school: signupDataWithoutStep.school || '',
        department: signupDataWithoutStep.department || '',
        interests: signupDataWithoutStep.interests || '',
        study_vibe: signupDataWithoutStep.study_vibe || [],
        user_image: userImageUrl
      };
      
      await authService.register(payload);
      
      // Clean up OAuth session storage after successful registration
      sessionStorage.removeItem("is_oauth_signup");
      sessionStorage.removeItem("google_oauth_token");
      
      resetSignup();
      router.push('/home');
      toast.success('Account created successfully!');
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account'
      toast.error(errorMessage)
      console.error('Signup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <section className="max-w-[341px] flex flex-col items-center w-full">
      <h1 className="text-[#737373] text-[29px] font-semibold text-center">Add a profile photo</h1>
      <p className="mt-6 text-[16px] font-medium text-center">
        Put a face to your studies. Upload a photo or design one right in{' '}
        <span className="text-[#FF3D00]">Clark Canvas</span>.
      </p>
      
      <div className="mt-8 relative">
        <div 
          className={`w-24 h-24 rounded-full border-4 ${previewUrl ? 'border-transparent' : 'border-[#D4D4D4]'} overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer`}
          onClick={triggerFileInput}
        >
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Profile preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <PictureInPicture2 className="text-gray-400 w-8 h-8" />
          )}
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        <button
          type="button"
          onClick={triggerFileInput}
          className="mt-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <UploadCloud className="w-4 h-4" />
          <span>{previewUrl ? 'Change photo' : 'Upload photo'}</span>
        </button>
      </div>
      
      <div className="relative flex items-center my-8 w-full">
        <div className="w-full border-t border-[#D4D4D4]"></div>
      </div>
      
      <div className="w-full flex flex-col gap-4">
        <Button 
          type="button" 
          className="bg-[#FF3D00] w-full py-3 h-12 text-base font-medium"
          onClick={handleSubmit}
          disabled={isLoading || !previewUrl}
        >
          {isLoading ? 'Creating account...' : 'Continue'}
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          className="w-full py-3 h-12 text-base font-medium text-gray-700 border-gray-300"
          onClick={onSuccess}
          disabled={isLoading}
        >
          Skip for now
        </Button>
      </div>
    </section>
  );
};

export default AddProfile;