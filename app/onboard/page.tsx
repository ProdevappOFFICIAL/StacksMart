"use client";

import dynamic from 'next/dynamic';

const AuthFlowClient = dynamic(() => import('./AuthFlowClient'), {
  ssr: false,
});

export default function Page() {
  return <AuthFlowClient />;
}
