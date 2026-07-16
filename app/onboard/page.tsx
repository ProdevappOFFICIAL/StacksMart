"use client";

import { useEffect, useState } from 'react';

export default function Page() {
  const [AuthFlow, setAuthFlow] = useState<any>(null);

  useEffect(() => {
    import('./AuthFlowClient').then((mod) => {
      setAuthFlow(() => mod.default);
    }).catch(console.error);
  }, []);

  if (!AuthFlow) {
    return null;
  }

  return <AuthFlow />;
}
