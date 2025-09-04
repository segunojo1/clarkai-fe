"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthClientLayout from '@/components/layout/auth-layout';
import { signupSchema } from "@/models/validations/auth.validation";
import SignUpForm from "@/components/auth/signup-form";
import VerifyEmail from "@/components/auth/verify-email";
import Verified from '@/components/auth/verified';
import AboutYou from '@/components/auth/about-you';
import StudyVibe from '@/components/auth/study-vibe';
import AddProfile from '@/components/auth/add-profile';
import useAuthStore from '@/store/auth.store';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react'; 

const variants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 100
    }
  },
  exit: (direction: number) => ({
    y: direction < 0 ? 600 : -600,
    opacity: 0,
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 100
    }
  })
};

const STEPS = [
  'signup',
  'verify-email',
  'verified',
  'about-you',
  'study-vibe',
  'add-profile'
] as const;

type Step = typeof STEPS[number];

const SignUpPage = () => {
  const router = useRouter();
  const { 
    signupData, 
    updateSignupData, 
    nextStep, 
    resetSignup 
  } = useAuthStore();

  const currentStep = signupData.currentStep || 0;
  let currentStepName = STEPS[currentStep] as Step;
  const [direction, setDirection] = useState(0);
  const [prevvStep, setPrevStep] = useState(0);

  const handleNextStep = () => {
    setDirection(1);
    setPrevStep(currentStep);
    nextStep();
  };

  // const handlePrevStep = () => {
  //   setDirection(-1);
  //   setPrevStep(currentStep);
  //   prevStep();
  // };

  // Update direction when step changes
  useEffect(() => {
    if (currentStep > prevvStep) {
      setDirection(1);
    } else if (currentStep < prevvStep) {
      setDirection(-1);
    }
  }, [currentStep, prevvStep]);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: signupData.name || "",
      email: signupData.email || "",
      nickname: signupData.nickname || "",
      password: signupData.password || "",
      confirmPassword: signupData.confirmPassword || ""
    },
  });

  const { data: session, status } = useSession();
  console.log(session, status);
  useEffect(() => {

  if (status === "authenticated" && session?.user?.backendAccessToken) {
    // Persist the token and flag
    sessionStorage.setItem("google_oauth_token", session.user.backendAccessToken);
    sessionStorage.setItem("is_oauth_signup", "true");

    // Update your local step state
    currentStepName = 'about-you';
  }
}, [status, session]);

  // Update form values when signupData changes
  useEffect(() => {
    if (signupData.email) {
      form.setValue('email', signupData.email);
    }
    if (signupData.name) {
      form.setValue('name', signupData.name);
    }
    if (signupData.nickname) {
      form.setValue('nickname', signupData.nickname);
    }
  }, [signupData, form]);

  const handleSignupSuccess = (values: z.infer<typeof signupSchema>) => {
    updateSignupData(values);
  };

  const handleVerificationSuccess = () => {
    nextStep();
  };

  const handleAboutYouSubmit = (data: {
            role: string,
            school: string,
            department: string,
            interests:string
        }) => {
    updateSignupData(data);
    nextStep();
  };

  const handleStudyVibeSubmit = (data: {
            study_vibe: string[]
        }) => {
    updateSignupData(data);
    nextStep();
  };

  const handleProfileComplete = () => {
    // Reset the signup flow and redirect to dashboard
    // The actual redirect happens in the AddProfile component after successful submission
    resetSignup();
    router.push('/home');
  };

  // const handleSkipProfile = () => {
  //   // Handle skip profile photo
  //   handleProfileComplete();
  // };

  const renderStep = () => {
    const stepComponents: Record<string, React.ReactNode> = {
      'signup': (
        <SignUpForm
          key="signup"
          form={form}
          onSubmit={handleSignupSuccess}
        />
      ),
      'verify-email': (
        <VerifyEmail 
          key="verify-email"
          email={signupData.email || ''} 
          onSuccess={handleVerificationSuccess} 
        />
      ),
      'verified': <Verified key="verified" onSuccess={handleNextStep} />,
      'about-you': <AboutYou key="about-you" onSuccess={handleAboutYouSubmit} />,
      'study-vibe': <StudyVibe key="study-vibe" onSuccess={handleStudyVibeSubmit} />,
      'add-profile': <AddProfile key="add-profile" onSuccess={handleProfileComplete} />
    };
    return stepComponents[currentStepName] || null;
  };

  const showSidebar = ['signup', 'verify-email', 'verified', 'add-profile'].includes(currentStepName);

  return (
    <AuthClientLayout 
      showSidebar={showSidebar}
      currentStep={currentStepName}
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          style={{
            width: '100%',
            height: '100%',
            position: 'relative'
          }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </AuthClientLayout>
  );
};

export default SignUpPage;