"use client";

import { AppConfig, UserSession, connect, disconnect as stacksDisconnect } from "@stacks/connect";
import { useEffect, useState, useCallback, useMemo } from "react";

// Define the shape of the address objects returned by the wallet
export interface StacksAddress {
  symbol?: string;
  address: string;
  publicKey: string;
}

// Define the shape of your normalized user data to replace 'any'
export interface StacksUserData {
  profile?: {
    stxAddress?: {
      mainnet?: string;
      testnet?: string;
    };
  };
  stxAddress?: string;
  addresses?: StacksAddress[];
  [key: string]: unknown; // Allows for additional properties returned by the session
}

export function useStacks() {
  const appConfig = useMemo(() => new AppConfig(["store_write", "publish_data"]), []);
  
  const userSession = useMemo(() => {
    if (typeof window === "undefined") return new UserSession({ appConfig });
    try {
      return new UserSession({ appConfig });
    } catch (e) {
      console.error("Error initializing UserSession:", e);
      // If there's a session error (like version mismatch), clear local storage for this key
      localStorage.removeItem('blockstack-session');
      return new UserSession({ appConfig });
    }
  }, [appConfig]);

  const [userData, setUserData] = useState<StacksUserData | null>(null);

  // Synchronize state with UserSession on mount and changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (userSession.isUserSignedIn()) {
        setUserData(userSession.loadUserData() as StacksUserData);
      } else if (userSession.isSignInPending()) {
        userSession.handlePendingSignIn().then((data) => {
          setUserData(data as StacksUserData);
        }).catch(err => {
          console.error("Pending sign-in error:", err);
        });
      } else {
        // Check for manual session storage if connect() was used without UserSession persist
        const savedData = localStorage.getItem("stacks-user-data");
        if (savedData) {
          try {
            setUserData(JSON.parse(savedData));
          } catch {
            console.warn("Failed to parse saved Stacks user data.");
          }
        }
      }
    }
  }, [userSession]);

  const connectWallet = useCallback(async () => {
    try {
      // Use the latest connect() implementation with config options
      const response = await connect({
        forceWalletSelect: true,
        network: 'mainnet',
      });

      if (response && response.addresses) {
        const stxAddress = response.addresses.find((a: StacksAddress) => a.symbol === "STX")?.address;
        
        // Construct a userData object that works with both old and new code
        const normalizedData: StacksUserData = {
          ...response,
          profile: {
            stxAddress: {
              mainnet: stxAddress,
              testnet: stxAddress,
            }
          },
          stxAddress // Direct access helper
        };
        
        setUserData(normalizedData);
        if (typeof window !== "undefined") {
          localStorage.setItem("stacks-user-data", JSON.stringify(normalizedData));
        }
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    try {
      userSession.signUserOut();
      stacksDisconnect();
      setUserData(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("stacks-user-data");
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [userSession]);

  return { userData, connectWallet, disconnectWallet, userSession };
}