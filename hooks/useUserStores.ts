import { useState, useEffect } from 'react';
import { fetchCallReadOnlyFunction, cvToJSON, uintCV } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';

const CONTRACT_ADDRESS = 'ST33KVQG68Y9737BMTC6J9PY4GXC2D5K0GG63GHT2';
const CONTRACT_NAME = 'marketplace';

export const useUserStores = (userAddress: string | null | undefined) => {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStores = async () => {
      if (!userAddress) {
          setLoading(false);
          return;
      }

      try {
        setLoading(true);
        // 1. Get the total number of stores
        const counterRes = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-store-counter', // Make sure this function exists in your contract!
            functionArgs: [],
            network: STACKS_TESTNET,
            senderAddress: CONTRACT_ADDRESS,
        });
        const total = Number(cvToJSON(counterRes).value);

        // 2. Fetch all stores and filter
        const allStores = [];
        for (let i = 1; i <= total; i++) {
            const storeRes = await fetchCallReadOnlyFunction({
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'get-store',
                functionArgs: [uintCV(i)],
                network: STACKS_TESTNET,
                senderAddress: CONTRACT_ADDRESS,
            });
            const store = cvToJSON(storeRes).value;
            
            // Compare the owner (assuming the contract returns the principal string)
            if (store && store.owner.value === userAddress) {
                allStores.push({ ...store, id: i });
            }
        }
        setStores(allStores);
      } catch (err) {
        console.error("Error fetching stores:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStores();
  }, [userAddress]);

  return { stores, loading, setStores }; // Added setStores for manual updates
};
