"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loading } from "@/components/ui/loading";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('AdminLayout: Auth check - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
    if (!isLoading && !isAuthenticated) {
      console.log('AdminLayout: No authentication token found, redirecting to onboard...');
      router.push('/onboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex flex-col w-full h-full bg-white">
        <div className="min-h-screen flex items-center justify-center">
          <Loading />
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children (redirect is happening)
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col w-full h-full bg-white">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loading />
            <p className="mt-4 text-gray-600">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return <div className="flex flex-col w-full h-full bg-white">{children}</div>;
}
