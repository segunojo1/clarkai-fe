"use client"
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from "@/models/validations/auth.validation"
import SignUpForm from "@/components/auth/signup-form";
import VerifyEmail from "@/components/auth/verify-email";
import Verified from '@/components/auth/verified';
import AboutYou from '@/components/auth/about-you';

type SignupState = {
  step: 'signup' | 'verify-email' | 'verified' | 'about-you';
  email?: string;
};

const SignUpPage = () => {
  const [state, setState] = useState<SignupState>({ step: 'signup' });
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      nickName: "",
      password: "",
      confirmPassword: ""
    },
  });

  const handleSignupSuccess = (values: z.infer<typeof signupSchema>) => {
    console.log('Signup successful', values);
    setState({ step: 'verify-email', email: values.email });
  };

  const renderStep = () => {
    switch (state.step) {
      case 'signup':
        return (
          <SignUpForm 
            form={form}
            onSubmit={handleSignupSuccess}
            onSuccess={(email) => setState({ step: 'verify-email', email })}
          />
        );
      case 'verify-email':
        return <VerifyEmail email={state.email || ''} onSuccess={() => setState({ step: 'verified' })}/>;
      case 'verified':
        return <Verified onSuccess={() => setState({ step: 'about-you'})} />;
    case 'about-you':
  return <AboutYou onSuccess={() => setState({ step: 'about-you'})} />
      default:
        return null;
    }
  };

  return (
    <div>
      {renderStep()}
    </div>
  );
};

export default SignUpPage;