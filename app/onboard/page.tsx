"use client";

import { useEffect, useState } from 'react';
import AuthFlowClient from './AuthFlowClient';

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <AuthFlowClient />;
}
