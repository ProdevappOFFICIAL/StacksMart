import { useEffect, useState, useMemo } from 'react';

export function useStacks() {
  const [address, setAddress] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check local storage for our custom saved address first
    const savedAddress = typeof window !== 'undefined' ? localStorage.getItem('stacks_wallet_address') : null;
    if (savedAddress) {
      setAddress(savedAddress);
    } else {
      import('@stacks/connect').then(({ isConnected, getLocalStorage }) => {
        if (isConnected()) {
          // Fallback to older blockstack connect approach
          const data = getLocalStorage();
          const stxAddress = data?.addresses?.stx?.[0]?.address;
          if (stxAddress) {
            setAddress(stxAddress);
            localStorage.setItem('stacks_wallet_address', stxAddress);
          }
        }
      }).catch(err => console.error("Failed to load @stacks/connect", err));
    }
  }, []);

  const connectWallet = async () => {
    try {
      const { request } = await import('@stacks/connect');
      // Initiates the wallet pop-up
      const result = await request('stx_getAddresses', {
        network: 'testnet',
      });

      // Find the actual STX address in the returned array
      const stxAddressObj = result?.addresses?.find(
        (addr: { symbol?: string; address: string }) => addr.symbol === 'STX' || addr.address.startsWith('ST') || addr.address.startsWith('SP')
      );
      
      const stxAddress = stxAddressObj?.address;

      if (stxAddress) {
        setAddress(stxAddress);
        localStorage.setItem('stacks_wallet_address', stxAddress);
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  const disconnectWallet = async () => {
    try {
      const { disconnect } = await import('@stacks/connect');
      // Clears the wallet cache from local storage
      disconnect(); 
      setAddress(null);
      localStorage.removeItem('stacks_wallet_address');
    } catch (e) {
      console.error(e);
    }
  };

  // Mocking the old UserData structure for backward compatibility
  // Memoize to prevent infinite re-renders when used as dependency
  const userData = useMemo(() => {
    return address ? {
      stxAddress: address,
      profile: {
        stxAddress: {
          mainnet: address,
          testnet: address
        }
      }
    } : null;
  }, [address]);

  return { userData, connectWallet, disconnectWallet, mounted };
}