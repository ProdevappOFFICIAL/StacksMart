// React hook for Stacks wallet management using @stacks/connect
import { useState, useEffect, useCallback } from "react";
interface UseStacksWalletReturn {
  isConnected: boolean;
  walletAddress: string | null;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  isWalletDetected: boolean;
}

interface UseStacksWalletOptions {
  autoConnect?: boolean;
}

/**
 * Hook for managing Stacks wallet connection using Stacks Connect
 * Supports HiroX, Stacks Wallet, and other compatible extensions
 */
export function useStacksWallet(options: UseStacksWalletOptions = { autoConnect: true }): UseStacksWalletReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWalletDetected, setIsWalletDetected] = useState(false);

  // Check for wallet extension on mount
  useEffect(() => {
    const checkWalletDetection = async () => {
      // Check if Stacks wallet extension is available
      // The window.StacksProvider object is set by wallet extensions
      const hasStacksWallet =
        typeof window !== "undefined" &&
        (window as any).StacksProvider !== undefined;

      setIsWalletDetected(hasStacksWallet);

      // Check localStorage for cached connection
      const cachedAddress = localStorage.getItem("stacks_wallet_address");
      if (options.autoConnect && cachedAddress && hasStacksWallet) {
        setWalletAddress(cachedAddress);
        setIsConnected(true);
      }
    };

    checkWalletDetection();
  }, [options.autoConnect]);

  const connectWallet = useCallback(async () => {
    if (isConnecting) return;

    setIsConnecting(true);
    setError(null);

    try {
      const { connect } = await import('@stacks/connect');
      // Use @stacks/connect to open wallet dialog
      const response = await connect({
        forceWalletSelect: true,
        network: "testnet", // Use testnet for now, can be made configurable
      });

      if (response) {
        // Extract the STX address - try multiple possible structures
        let stxAddress: string | null = null;

        // Try profile.stxAddress (might be string or object)
        if ((response as any).profile?.stxAddress) {
          const addr = (response as any).profile.stxAddress;
          if (typeof addr === 'string') {
            stxAddress = addr;
          } else if (typeof addr === 'object') {
            stxAddress = addr.testnet || addr.mainnet;
          }
        }

        // Fallback: try addresses array
        if (!stxAddress && response.addresses) {
          const stacksAddr = response.addresses.find(
            (a: any) => a.symbol === 'STX' || a.symbol === 'STACKS'
          );
          if (stacksAddr) {
            stxAddress = stacksAddr.address;
          }
        }

        // Last resort: check if response itself has address
        if (!stxAddress && (response as any).address) {
          stxAddress = (response as any).address;
        }

        if (!stxAddress) {
          console.error('Wallet response structure:', response);
          throw new Error('No Stacks address found in wallet response');
        }

        // Store address and mark as connected
        setWalletAddress(stxAddress);
        setIsConnected(true);

        // Cache the address in localStorage
        localStorage.setItem("stacks_wallet_address", stxAddress);

        console.log("Stacks wallet connected:", stxAddress);
      } else {
        throw new Error("Empty wallet response");
      }
    } catch (err) {
      let errorMessage = "Failed to connect Stacks wallet";

      if (err instanceof Error) {
        if (
          err.message.includes("cancelled") ||
          err.message.includes("dismissed") ||
          err.message.includes("closed")
        ) {
          errorMessage = "Wallet connection was cancelled";
        } else if (err.message.includes("not found")) {
          errorMessage =
            "Stacks wallet extension not detected. Please install Leather, Xverse, or HiroX wallet.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      console.error("Stacks wallet connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting]);

  const disconnectWallet = useCallback(async () => {
    try {
      // Clear local connection state
      setIsConnected(false);
      setWalletAddress(null);
      setError(null);

      // Clear cached address
      localStorage.removeItem("stacks_wallet_address");

      console.log("Stacks wallet disconnected");
    } catch (err) {
      console.error("Wallet disconnection error:", err);
      setError("Failed to disconnect wallet");
    }
  }, []);

  return {
    isConnected,
    walletAddress,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    isWalletDetected,
  };
}
