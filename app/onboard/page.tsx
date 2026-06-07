"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStacks } from '@/lib/use-stacks';
import { useAuth } from '@/contexts/AuthContext';
import { abbreviateAddress } from '@/lib/stx-utils';
import { authApi } from '@/lib/api';
import { Eye, Smile, Rocket, Check, LogOut, User, Lock, ArrowRight } from 'lucide-react';
import { BsFillWalletFill } from 'react-icons/bs';
import { IoChevronForwardSharp } from "react-icons/io5";
import Image from 'next/image';

// Assuming signMessage returns a promise or handles the flow
import { openSignatureRequestPopup } from '@stacks/connect';

const AuthFlow = () => {
  const router = useRouter();
  const { userData, connectWallet, disconnectWallet, userSession } = useStacks();
  const { setToken } = useAuth();
  
  // State Management
  const [step, setStep] = useState(1);
  const [isSigning, setIsSigning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Auth Mode: 'signup' or 'login'
  const [authMode, setAuthMode] = useState('signup'); 
  
  // Credentials State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState({ message: '', type: '' }); // type: 'success' | 'error'

// Helper to clear feedback after 5 seconds
useEffect(() => {
  if (feedback.message) {
    const timer = setTimeout(() => setFeedback({ message: '', type: '' }), 5000);
    return () => clearTimeout(timer);
  }
}, [feedback]);

  useEffect(() => {
    if (userData && step === 1) {
      setStep(2);
    }
  }, [userData, step]);

  const steps = [
    { id: 1, title: 'Connect Wallet' },
    { id: 2, title: 'Sign message' },
    { id: 3, title: authMode === 'signup' ? 'Create Account' : 'Welcome Back' },
  ];

  const handleNextStep = () => {
    // Validate wallet connection before proceeding to next step
    const address = userData?.profile?.stxAddress?.mainnet || userData?.stxAddress;
    if (step === 1 && !address) {
      setFeedback({ 
        message: 'Please connect your wallet first', 
        type: 'error' 
      });
      return;
    }
    
    if (step < steps.length) setStep(step + 1);
  };

  const handleSignMessage = async () => {
    setIsSigning(true);
    try {
   
    openSignatureRequestPopup({
      message: "Sign in to StacksMart \nStacksMart is a decentralized eccomerce based on Stacks L2 Bitcion",
      userSession, // Use the userSession from useStacks
      onFinish: (data) => {
        console.log("Signature:", data.signature);
        console.log("Public key:", data.publicKey);
        setStep(3);
      },
      onCancel: () => {
        console.log("User cancelled signing");
      }
    });

     
    } catch (error) {
      console.error("Signature failed", error);
    } finally {
      setIsSigning(false);
    }
  };
const handleAuthSubmit = async (e: React.FormEvent) => {
  if (e) e.preventDefault();
  setIsLoading(true);
  setFeedback({ message: '', type: '' }); // Reset feedback

  const walletAddress = userData?.profile?.stxAddress?.mainnet || userData?.stxAddress || "";
  
  // Validate wallet address before proceeding
  if (!walletAddress) {
    setFeedback({ 
      message: 'Wallet address not found. Please reconnect your wallet.', 
      type: 'error' 
    });
    setIsLoading(false);
    setStep(1); // Go back to wallet connection step
    return;
  }
  
  console.log('Auth attempt:', {
    mode: authMode,
    email: username,
    walletAddress,
  });

  try {
    let result;
    
    if (authMode === 'signup') {
      result = await authApi.register(username, password, walletAddress);
    } else {
      result = await authApi.login(username, password, walletAddress);
    }

    console.log('Auth result:', result);

    if (result.token) {
      console.log('Token received, storing...');
      setToken(result.token);
      
      setFeedback({ 
        message: `${authMode === 'signup' ? 'Account created' : 'Login'} successful! Redirecting...`, 
        type: 'success' 
      });

      // Short delay so they can see the success message
      setTimeout(() => router.push('/admin'), 1500);
    } else {
      throw new Error('No authentication token received');
    }

  } catch (error: unknown) {
    console.error('Auth error:', error);
    let errorMessage = 'Authentication failed';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    setFeedback({ message: errorMessage, type: 'error' });
  } finally {
    setIsLoading(false);
  }
};
  return (
    <div className="flex flex-col w-full min-h-screen items-center bg-white p-6 font-sans text-slate-900">
      <div className="flex flex-row w-full h-full">
        <div className="flex flex-col w-full h-full">
          <Image src={`/Stacks_Store_icon.png`} width={100} height={100} className="mb-6" alt="logo" />

          {/* Wallet Status Header */}
          {userData && (
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-slate-600 text-sm font-medium">
                    {abbreviateAddress(userData.profile?.stxAddress?.mainnet || userData.stxAddress || '')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={disconnectWallet}
                  className="px-3 py-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-r-lg transition-colors border-l border-slate-200"
                  title="Disconnect Wallet"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="w-full max-w-xl">
            {/* Debug Auth Status */}
        
            {/* Stepper Header */}
            <div className="flex items-center gap-4 mb-12">
              {steps.map((s, idx) => {
                const isCompleted = step > s.id;
                const isActive = step === s.id;

                return (
                  <React.Fragment key={s.id}>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-xl font-bold transition-colors ${isActive || isCompleted ? 'text-slate-900' : 'text-slate-300'}`}>
                          0{s.id}
                        </span>
                        <span className={`text-sm font-medium transition-colors ${isActive || isCompleted ? 'text-slate-600' : 'text-slate-300'}`}>
                          {s.title}
                        </span>
                      </div>
                      
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500
                        ${isCompleted ? 'bg-blue-600 border-blue-600' : ''}
                        ${isActive ? 'border-dashed border-blue-600 bg-white shadow-md' : 'border-solid border-slate-200 '}
                      `}>
                        {isCompleted ? (
                          <Check size={20} className="text-white stroke-[3]" />
                        ) : (
                          isActive && <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                        )}
                      </div>
                    </div>

                    {idx < steps.length - 1 && (
                      <div className={`flex-grow h-[5px] rounded-full mt-10 transition-colors duration-500 ${isCompleted ? 'bg-blue-600' : 'bg-slate-800/20'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Content Body */}
            <div className="space-y-6">
              {/* Feedback Message */}
{feedback.message && (
  <div className={`p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
    feedback.type === 'success' 
      ? 'bg-green-50 border border-green-200 text-green-700' 
      : 'bg-red-50 border border-red-200 text-red-700'
  }`}>
    {feedback.type === 'success' ? <Check size={18} /> : <Lock size={18} />}
    <p className="text-sm font-medium">{feedback.message}</p>
  </div>
)}
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                {step === 3 ? (authMode === 'signup' ? 'Create Account' : 'Login') : `Step ${step}`}
              </h2>
              
              {/* STEP 1: CONNECT */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2 text-lg text-slate-600 leading-relaxed">
                    <p>StacksMart is a decentralised eccomerce platform.</p>
                    <p>To access StackMart, you need to connect your wallet.</p>
                  </div>

                  <div className="flex items-center justify-end gap-8 pt-4">
                    {!userData ? (
                      <button
                        onClick={connectWallet}
                        className="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 hover:shadow-lg shadow-blue-200"
                      >
                        <span className="relative flex items-center gap-2">
                          <BsFillWalletFill className="w-4 h-4" />
                          Connect Wallet
                        </span>
                      </button>
                    ) : (
                      <button 
                        onClick={handleNextStep} 
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all shadow-md"
                      >
                        Proceed <IoChevronForwardSharp />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: SIGN */}
              {step === 2 && (
                <div className="py-12 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <p className="text-slate-500 mb-6 text-sm">Please sign the authentication message in your wallet</p>
                  <button
                    onClick={handleSignMessage}
                    disabled={isSigning}
                    className="px-8 py-3 rounded-md shadow bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:bg-slate-300"
                  >
                    {isSigning ? 'Signing...' : 'Sign Message with Wallet'}
                  </button>
                </div>
              )}

              {/* STEP 3: LOGIN / SIGNUP */}
              {step === 3 && (
                <form onSubmit={handleAuthSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {/* Show connected wallet */}
                  {(userData?.profile?.stxAddress?.mainnet || userData?.stxAddress) && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-700 font-medium">
                        Wallet: {abbreviateAddress(userData.profile?.stxAddress?.mainnet || userData.stxAddress || '')}
                      </span>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        required
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Identifier"
                        className="w-full  border border-slate-200 rounded-md py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                 
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        required
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                          className="w-full  border border-slate-200 rounded-md py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                        />
                    </div>
                  </div>

                  <div className="pt-4 space-y-4">
                    <button
                      type="submit"
                      disabled={!username || !password || isLoading}
                      className="w-full py-4 rounded shadow bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:bg-slate-300 shadow-blue-200 flex items-center justify-center gap-2"
                    >
                      {isLoading ? 'Processing...' : authMode === 'signup' ? 'Create Account' : 'Login'}
                      {!isLoading && <ArrowRight size={18} />}
                    </button>

                    <p className="text-center text-sm text-slate-500">
                      {authMode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
                      <button 
                        type="button"
                        onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        {authMode === 'signup' ? 'Login' : 'Sign Up'}
                      </button>
                    </p>
                  </div>
                </form>
              )}

              <hr className="border-slate-100 my-8" />

              {/* Footer Icons */}
              <div className="space-y-4 text-sm text-slate-400">
                <div className="flex items-start gap-3">
                  <Eye size={18} className="text-slate-300" />
                  <p>All rights reserved. We will never do anything without your approval.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Smile size={18} className="text-slate-300" />
                  <p>Code is <span className="underline cursor-pointer hover:text-slate-600">open-source.</span></p>
                </div>
                <div className="flex items-start gap-3">
                  <Rocket size={18} className="text-slate-300" />
                  <p>StacksMart v1.0</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-full h-full relative">
          <Image
            src={'/illustration.png'}
            width={1600}
            height={1400}
            alt="StacksMart_Dashboard"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default AuthFlow;