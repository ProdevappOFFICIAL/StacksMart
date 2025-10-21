"use client"
import React, { useState } from 'react';
import { Flame, User, LogOut, ChevronRight, Wallet } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import { WalletService } from '@/lib/wallet';
import { WalletConnectDialog } from '@/components/wallet/wallet-connect-dialog';
import { BsFillWalletFill, BsGithub } from 'react-icons/bs';
import { useStacks } from '@/lib/use-stacks';
import { abbreviateAddress } from '@/lib/stx-utils';

export default function WebPlatform() {
  const { isConnected, walletAddress, isConnecting } = useWallet();
  const walletService = WalletService.getInstance();
  const authToken = typeof window !== 'undefined' ? walletService.getAuthToken() : null;
  const [showWalletDialog, setShowWalletDialog] = useState(false);

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const { userData, connectWallet, disconnectWallet } = useStacks()

  return (
    <div className="h-full w-full bg-gray-50" suppressHydrationWarning>
      {/* Top Banner */}


      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 px-4 text-center text-xs font-medium">
        <span className="inline-flex items-center gap-2">
          <Flame className="w-4 h-4 text-yellow-400" />
          <span>
            <strong>Create Online Store now!</strong> get started with StacksMart, the best Web3 ecommerce platform for creators and developers.
          </span>
        </span>
      </div>

      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-700">
        <div className="w-full mx-auto px-4 sm:px-8 lg:px-16 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image src={'/Stacks_Store_icon.png'}
              height={60}
              width={60}
              className="sm:h-20 sm:w-20"
              alt='StacksMart_Logo' />
          </div>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-8">
            <Link href="/explore" className="text-gray-700 hover:text-gray-900 font-medium">
              Explore
            </Link>
            <Link href="/features" className="text-gray-700 hover:text-gray-900 font-medium">
              Features
            </Link>
            <Link href="/howitworks" className="text-gray-700 hover:text-gray-900 font-medium">
              How it works?
            </Link>
            <a href="#" className="text-gray-700 hover:text-gray-900 font-medium hidden">
              Pricing
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900 font-medium hidden">
              Blog
            </a>
          </nav>

          {/* Wallet & CTA Section */}
          <div className="flex items-center gap-2 sm:gap-4">

            {userData ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] transition-transform duration-700"></div>
                  <span className="relative flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Coming soon
                  </span>
                </button>
                <div className="flex items-center bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-700 text-sm font-medium">
                      {abbreviateAddress(userData.profile.stxAddress.mainnet)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={disconnectWallet}
                    className="group px-3 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 border-l border-gray-200 rounded-r-lg transition-all duration-200"
                    title="Disconnect Wallet"
                  >
                    <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={connectWallet}
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative flex items-center gap-2">
                  <BsFillWalletFill className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  Connect Wallet
                </span>
              </button>
            )}

        
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full mx-auto px-4 sm:px-8 lg:px-16 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column - Hero Content */}
          <div className="space-y-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
              Web3 ecommerce for sellers and creators
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed">
              StacksMart is a secured and open-source ecommerce platform for web3 sellers , creators and developers to create, manage and sell digital products powered by blockchain technology.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              {isConnected && authToken ? (
                <Link
                  href="/admin"
                  className="bg-indigo-600 text-white px-6 sm:px-8 py-3.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm text-center"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  href="/"
                  className="bg-indigo-600 text-white px-6 sm:px-8 py-3.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm text-center"
                >
                  Get Started
                </Link>
              )}
              <a href='http://docs.google.com/forms/d/e/1FAIpQLSegIYqoTgB6U9s-cQDsx_Csf2b8Jfa3JJ8jz8EcrJg1oGssIg/viewform' target='_blank' className="bg-white text-gray-900 px-6 sm:px-8 py-3.5 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-300">
                Join Waitlist
              </a>
            </div>

            {/* Blockchain Tags */}
            <div className="flex items-center gap-3">
              <a href='https://stacks.org/' target='_blank' className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border-2 border-orange-500 text-orange-500 font-bold text-xs sm:text-sm bg-white">
                <Image 
            src={'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIACgAKAMBEQACEQEDEQH/xAAYAAEAAwEAAAAAAAAAAAAAAAAAAwQGBf/EACsQAAAFAQYEBwEAAAAAAAAAAAABAgMRBAUSExUhcTEyQWEiNUJRgqHSFP/EABoBAQADAAMAAAAAAAAAAAAAAAACAwUEBgf/xAAqEQACAQIEBAUFAAAAAAAAAAAAAQIDEQQSE0ExUYLBISNh0fAUMmJjcf/aAAwDAQACEQMRAD8Atjqx6AAAAAAAAAE9C2w7VtN1bqmmVHCnElN3vsJ01FySk7IqrSnGm5U1drYsJsiqO18sMiJ4lQavSSeN7aNRZoT1dLf54lLxlP6fX278itWIYbqnUUrinWUqhC1FBq7iuaipNRd0X0ZTlTTqKz5EIgWAAdewsPCexMo5i8wI5+MdBysPls75eoz8bmzK2fp7mmPMPFJ2BP8ALroucD8/Q0PM/Hh68PYxvI/Zx9Pu9zM27h3GcPKeJzl5HPTmkZ+Iy2VsvSbOCzXlfP1djkDimgABPQuMM1bTlU0bzSDlTZHF72LYTpuMZJyV0VV4znTcabs3uTptaqK1szNUvX5Muhlwu7RoJqvPV1d/ngVPB0/p9Dbvz/pXrFsOVTq6Vo2mVKlLZnN3sITcXJuKsi6jGcaaVR3fMhECwAAAAAAAAP/Z'}
                className='rounded-md' width={24} height={24} alt='stacks' />
                <span className="hidden sm:inline">Powered by Stacks</span>
                <span className="sm:hidden">Stacks</span>

              </a>


            </div>
          </div>

          {/* Right Column - Image Section */}
          <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 mt-8 lg:mt-0">
            <div className="relative w-full max-w-2xl lg:max-w-4xl xl:max-w-7xl aspect-[4/3] lg:aspect-[16/10]">
              {/* First Box - Behind (Black card) */}
              <div className="absolute top-4 sm:top-6 lg:top-8 right-4 sm:right-6 lg:right-8 bg-black rounded-lg w-full h-full flex items-center justify-center z-10">
              </div>

              {/* Second Box - On Top (Image card) */}
              <div className="absolute top-0 right-0 overflow-hidden z-20 w-full h-full">
                <Image
                  src={'/stacks-mart.png'}
                  width={1600}
                  height={1400}
                  alt="StacksMart_Dashboard"
                  className="w-full h-full object-cover border border-gray-700 rounded-lg"
                />
              </div>
            </div>
          </div>





        </div>

      </main>



      {/* Wallet Connect Dialog */}
      <WalletConnectDialog
        isOpen={showWalletDialog}
        onClose={() => setShowWalletDialog(false)}
        onSuccess={(address) => {
          console.log('Wallet connected:', address);
          // Reload the page to refresh the UI with the connected wallet state
          window.location.reload();
        }}
      />

    </div>
  );
}